import { aiClient, MODEL_NAME } from '../config/gemini';
import { ProjectBrief, ProjectPackage, OutlineSection, ScriptBlock, SceneSegment, StyleBible, PromptCard, ScriptMemory, Blueprint, ScriptEntity, ValidationIssue } from '../types/ai';
import { generateOutlinePrompt } from './ai/prompts/outlinePrompt';
import { generateScriptSectionPrompt } from './ai/prompts/scriptPrompt';
import { generateSceneMapPrompt } from './ai/prompts/sceneMapPrompt';
import { generateStyleBiblePrompt } from './ai/prompts/styleBiblePrompt';
import { generatePromptCardsPrompt } from './ai/prompts/promptCardsPrompt';
import { generateEntitiesPrompt } from './ai/prompts/entityPrompt';
import { generatePolishPrompt } from './ai/prompts/polishPrompt';
import { Blueprints } from './ai/blueprints';
import { batchValidatePrompts } from './ai/validators/promptQA';
import { batchValidateScript } from './ai/validators/scriptValidators';
import { validateSceneMapDuration } from './ai/validators/sceneMapValidators';
import fs from 'fs';
import path from 'path';

// Logging Helper
const LOGS_BASE_DIR = path.join(process.cwd(), 'logs');

function logStep(runDir: string, stepName: string, data: any) {
  try {
    const filePath = path.join(runDir, `${stepName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Failed to log step ${stepName}:`, err);
  }
}

// Robustness: Retry Logic
async function withRetry<T>(fn: () => Promise<T>, retries = 1, context = ''): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            console.warn(`Retry (${retries} left) due to error in ${context}:`, error);
            return withRetry(fn, retries - 1, context);
        }
        throw error;
    }
}

// Helpers
async function generateJSON<T>(prompt: string): Promise<T> {
  if (!aiClient) throw new Error("AI Client not initialized");

  const response = await aiClient.models.generateContent({
    model: MODEL_NAME,
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No content generated");

  // Robust cleanup: support both Array [...] and Object {...}
  const firstOpenBrace = text.indexOf('{');
  const firstOpenBracket = text.indexOf('[');
  
  let start = -1;
  let end = -1;

  // Determine if it looks like an Object or an Array based on which comes first
  if (firstOpenBracket !== -1 && (firstOpenBrace === -1 || firstOpenBracket < firstOpenBrace)) {
      // It's likely an Array
      start = firstOpenBracket;
      end = text.lastIndexOf(']');
  } else if (firstOpenBrace !== -1) {
      // It's likely an Object
      start = firstOpenBrace;
      end = text.lastIndexOf('}');
  }

  let cleaned = text;
  if (start !== -1 && end !== -1 && end > start) {
      cleaned = text.slice(start, end + 1);
  } else {
      // Fallback cleanup
      cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  // Fix common JSON errors naive approach
  if (cleaned.endsWith(',') || cleaned.endsWith(',]')) cleaned = cleaned.replace(/,(\s*\])/, '$1');

  try {
      return JSON.parse(cleaned) as T;
  } catch (e) {
      throw new Error(`Failed to parse JSON: ${e} \nRaw: ${cleaned.slice(0, 100)}...`);
  }
}

async function generateText(prompt: string): Promise<string> {
    if (!aiClient) throw new Error("AI Client not initialized");
  
    const response = await aiClient.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
  
    return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

import { imageService } from './imageService';
import { audioService } from './audioService';

// ... (existing imports)

export const aiService = {
  generateAudio: async (packageData: ProjectPackage): Promise<ProjectPackage> => {
     console.log("Generating Audio for Project...");
     
     // Validate package has necessary data
     if (!packageData.sceneMap) throw new Error("Scene Map is missing.");

     const audioUrl = await audioService.generateFullScriptAudio(
         packageData.sceneMap,
         packageData
     );
     
     return {
         ...packageData,
         fullAudioUrl: audioUrl || undefined
     };
  },

  generateVisuals: async (packageData: ProjectPackage): Promise<ProjectPackage> => {
     console.log("Generating Visuals for Project...");
     
     if (!packageData.brief) {
         // Fallback if brief is missing (for older runs)
         console.warn("Project Package is missing the original Brief. Using defaults.");
         packageData.brief = {
             title: 'Unknown',
             goal: '',
             format: '16:9',
             targetDurationSec: 60,
             blueprint: 'narrative',
             visualStyle: 'cinematic',
             languages: ['en']
         };
     }

     const updatedScenes = await imageService.generateSceneImages(
         packageData.sceneMap,
         packageData.styleBible,
         packageData.brief as ProjectBrief
     );
     
     return {
         ...packageData,
         sceneMap: updatedScenes
     };
  },

  generateFullProject: async (brief: ProjectBrief): Promise<ProjectPackage> => {
    const runId = `run_${Date.now()}`;
    const runDir = path.join(LOGS_BASE_DIR, runId);
    
    if (!fs.existsSync(LOGS_BASE_DIR)) fs.mkdirSync(LOGS_BASE_DIR);
    if (!fs.existsSync(runDir)) fs.mkdirSync(runDir);

    console.log(`Starting Full Project Generation for: ${brief.title} (Run ID: ${runId})`);
    logStep(runDir, '00_brief', brief);
    
    // 1. Select Blueprint & Budgeting
    const blueprint: Blueprint = Blueprints[brief.blueprint] || Blueprints['narrative'];
    console.log(`Step 1: Budgeting using ${blueprint.type} blueprint...`);
    
    const pacing = blueprint.pacingStrategy(brief.targetDurationSec, brief.blueprintParams);
    const wpm = 130; // Reduced from 150 for better pacing (User feedback)
    const targetWords = Math.round((brief.targetDurationSec / 60) * wpm);
    
    const budget = {
      wpm,
      targetWords,
      minWords: Math.floor(targetWords * 0.9),
      maxWords: Math.floor(targetWords * 1.1),
      hookSec: pacing.hookSec || 0,
      bodySec: pacing.bodySec || 0,
      closeSec: pacing.closeSec || 0,
      secPerItem: pacing.secPerItem
    };
    logStep(runDir, '01_budget', { blueprint: blueprint.type, budget });

    // 2. Outline (Retry-able)
    console.log("Step 2: Generating Outline...");
    const outlinePrompt = generateOutlinePrompt(brief, budget, blueprint);
    const outlineData = await withRetry(() => generateJSON<{ sections: OutlineSection[] }>(outlinePrompt), 2, 'Outline Generation');
    logStep(runDir, '02_outline', { prompt: outlinePrompt, output: outlineData });
    
    // 2.5 Entities Lock
    console.log("Step 2.5: Generating Entities Lock...");
    const entitiesPrompt = generateEntitiesPrompt(brief, outlineData.sections);
    const entitiesLock = await withRetry(() => generateJSON<ScriptEntity[]>(entitiesPrompt), 2, 'Entities Lock');
    logStep(runDir, '02_entities_lock', entitiesLock);

    // 3. Script Blocks with Structured Memory
    console.log("Step 3: Writing Script Blocks...");
    let scriptBlocks: ScriptBlock[] = [];
    
    // Initialize Memory
    const voiceProfile = blueprint.voiceProfile || {
        tone: 'neutral',
        audience: 'general',
        styleRules: ["Clear and concise"],
        bannedPhrases: [],
        bannedCliches: [],
        ctaPolicy: "none"
    };

    const memory: ScriptMemory = {
        thesis: brief.goal,
        outlineSummary: outlineData.sections.map(s => `${s.title}: ${s.goal}`).join('; '),
        runningSummary: "Starting script generation.",
        facts: [],
        bannedRepetitions: [...voiceProfile.bannedPhrases, ...voiceProfile.bannedCliches],
        terminologyLock: [], 
        entities: entitiesLock, // Use the locked entities
        styleVoiceRules: [
            ...voiceProfile.styleRules,
            `Tone: ${voiceProfile.tone}`,
            `Audience: ${voiceProfile.audience}`,
            `Language: ${brief.languages.join(', ')} (STRICT)`
        ]
    };

    for (const [index, section] of outlineData.sections.entries()) {
        console.log(`   - Writing section: ${section.title}`);
        const scriptPrompt = generateScriptSectionPrompt(brief, section, memory);
        
        const text = await withRetry(() => generateText(scriptPrompt), 2, `Script Section ${section.id}`);
        
        const block: ScriptBlock = {
            sectionId: section.id,
            text: text.trim(),
            wordCount: text.split(' ').length,
            estimatedSec: Math.round(text.split(' ').length / (wpm / 60)),
            version: 1,
            translations: {} 
        };
        scriptBlocks.push(block);
        
        const newSummary = `[Section ${section.title}: ${text.slice(0, 100)}...] `;
        memory.runningSummary = (memory.runningSummary + newSummary).slice(-1000); 
        
        logStep(runDir, `03_script_block_${index}_${section.id}`, { prompt: scriptPrompt, output: text, block, memoryState: { ...memory } });
    }

    // 3.5 Polish Pass
    console.log("Step 3.5: Polish Pass...");
    const polishPrompt = generatePolishPrompt(scriptBlocks, voiceProfile, brief.languages[0]);
    
    interface PolishResponse {
        voiceStyleInstructions: string;
        polishedBlocks: {id: string, text: string}[];
    }

    // The Polish Prompt returns an object { voiceStyleInstructions, polishedBlocks }
    const polishedData = await withRetry(() => generateJSON<PolishResponse>(polishPrompt), 2, 'Polish Pass');
    
    // Update blocks with polished text
    scriptBlocks = scriptBlocks.map(block => {
        const polished = polishedData.polishedBlocks.find(p => p.id === block.sectionId);
        if (polished) {
            return {
                ...block,
                text: polished.text,
                wordCount: polished.text.split(' ').length,
                estimatedSec: Math.round(polished.text.split(' ').length / (wpm / 60)),
                version: 2
            };
        }
        return block;
    });
    logStep(runDir, '03_script_polished', { blocks: scriptBlocks, instructions: polishedData.voiceStyleInstructions });

    // 3.6 Script Validation
    console.log("Step 3.6: Script Validation...");
    const scriptValidation = batchValidateScript(scriptBlocks, voiceProfile, brief.languages[0]);
    logStep(runDir, '03_script_validation', scriptValidation);
    // Note: If fail, we could trigger another rewrite loop here. For now, we report.

    // 4. Scene Map
    console.log("Step 4: Generating Scene Map...");
    const sceneMapPrompt = generateSceneMapPrompt(scriptBlocks, brief.targetDurationSec);
    const sceneMap = await withRetry(() => generateJSON<SceneSegment[]>(sceneMapPrompt), 2, 'Scene Map');
    
    // 4.5 Scene Map Validation
    const sceneMapValidation = validateSceneMapDuration(sceneMap, brief.targetDurationSec);
    logStep(runDir, '04_sceneMap', { prompt: sceneMapPrompt, output: sceneMap, validation: sceneMapValidation });

    // 5. Style Bible
    console.log("Step 5: Creating Style Bible...");
    const styleBiblePrompt = generateStyleBiblePrompt(brief);
    const styleBible = await withRetry(() => generateJSON<StyleBible>(styleBiblePrompt), 2, 'Style Bible');
    
    // Inject Entities into Style Bible's Continuity Bible for visual consistency
    styleBible.continuityBible = {};
    entitiesLock.forEach(e => {
        if (styleBible.continuityBible) {
            styleBible.continuityBible[e.name] = e.description;
        }
    });

    logStep(runDir, '05_styleBible', { prompt: styleBiblePrompt, output: styleBible });

    // 6. Prompt Cards
    console.log("Step 6: Generating Prompt Cards...");
    const promptCardsPrompt = generatePromptCardsPrompt(sceneMap, styleBible, brief);
    let promptCards = await withRetry(() => generateJSON<PromptCard[]>(promptCardsPrompt), 2, 'Prompt Cards');
    
    // 6.5 Prompt QA
    console.log("Step 6.5: Running Prompt QA...");
    // Pass subtitlesEnabled flag (default true if undefined)
    const subtitlesEnabled = brief.subtitlesEnabled !== false; 
    promptCards = batchValidatePrompts(promptCards, subtitlesEnabled);
    
    logStep(runDir, '06_promptCards', { prompt: promptCardsPrompt, output: promptCards });

    // 7. Assemble Package
    const pkg: ProjectPackage = {
        projectId: 'temp-' + Date.now(),
        runId,
        brief, // Store the brief
        version: 'draft-1',
        blueprint: brief.blueprint,
        budgets: budget,
        outline: outlineData,
        scriptBlocks,
        sceneMap,
        styleBible,
        promptCards,
        entitiesLock, // Store the single source of truth
        voiceStyleInstructions: polishedData.voiceStyleInstructions,
        validation: { 
            status: (scriptValidation.status === 'fail' || sceneMapValidation.status === 'fail') ? 'fail' : 'ok',
            issues: [...scriptValidation.issues, ...sceneMapValidation.issues, ...promptCards.flatMap(p => (p.qaIssues || []).map(i => ({ type: 'warn' as const, message: `[Prompt] ${i}` })))]
        }
    };
    
    logStep(runDir, '07_final_package', pkg);
    
    return pkg;
  }
};