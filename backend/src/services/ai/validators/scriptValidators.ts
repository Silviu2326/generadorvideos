import { ScriptBlock, ValidationIssue, VoiceProfile } from '../../../types/ai';

export const validateScriptBlock = (block: ScriptBlock, voiceProfile: VoiceProfile, targetLang: string): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];
    const textLower = block.text.toLowerCase();
    
    // 1. Language Validator (Heuristic: Detect common English words if target is ES)
    if (targetLang === 'ES') {
        const englishIndicators = [" the ", " and ", " with ", " this ", " video "]; // simple check
        const englishCount = englishIndicators.filter(w => textLower.includes(w)).length;
        if (englishCount > 2) {
             issues.push({ type: 'fail', where: block.sectionId, message: 'Detected English text in Spanish script.' });
        }
    }

    // 2. Cliche/Meta Validator
    const banned = [...(voiceProfile.bannedPhrases || []), ...(voiceProfile.bannedCliches || [])];
    const metaPhrases = ["this video", "this story", "in this section", "este video", "esta historia", "en este video"];
    
    const allBanned = [...banned, ...metaPhrases].map(p => p.toLowerCase());
    
    for (const phrase of allBanned) {
        if (textLower.includes(phrase)) {
             issues.push({ type: 'warn', where: block.sectionId, message: `Contains banned phrase: "${phrase}"` });
        }
    }

    return issues;
};

export const batchValidateScript = (blocks: ScriptBlock[], voiceProfile: VoiceProfile, targetLang: string): { status: 'ok'|'warn'|'fail', issues: ValidationIssue[] } => {
    let allIssues: ValidationIssue[] = [];
    
    for (const block of blocks) {
        allIssues = [...allIssues, ...validateScriptBlock(block, voiceProfile, targetLang)];
    }

    const hasFail = allIssues.some(i => i.type === 'fail');
    const hasWarn = allIssues.some(i => i.type === 'warn');

    return {
        status: hasFail ? 'fail' : (hasWarn ? 'warn' : 'ok'),
        issues: allIssues
    };
};
