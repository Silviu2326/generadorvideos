import { api } from '../services/api';
import { ScriptScene } from '../services/geminiService';
import React, { useState } from 'react';
import { X, Smartphone, Monitor, Square, Check, Mic, Type, ChevronRight, Wand2, ChevronLeft, Play, Clock, Image as ImageIcon, Music, RefreshCw, Save, Download, Eye } from 'lucide-react';

interface NewProjectWizardProps {
  onClose: () => void;
}

const NewProjectWizard: React.FC<NewProjectWizardProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [scriptData, setScriptData] = useState<any[]>([]);
  const [fullProject, setFullProject] = useState<any>(null); // New state for V2 package
  const [fullscreenImage, setFullscreenImage] = useState<{url: string, sceneNumber: number} | null>(null);
  const [previewGallery, setPreviewGallery] = useState<{styleId: string, styleName: string, images: string[]} | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    format: '16:9',
    duration: '60s',
    style: 'cyberpunk',
    voice: 'alloy',
    language: 'ES',
    subtitles: true,
    subtitleStyle: 'modern'
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todo' },
    { id: 'cinematic', label: 'Cine & Realismo' },
    { id: 'anime', label: 'Anime & Manga' },
    { id: 'art', label: 'Arte Clásico' },
    { id: 'digital', label: 'Digital & 3D' },
    { id: 'comic', label: 'Cómics' },
    { id: 'retro', label: 'Vintage' }
  ];

  const getStyleImages = (id: string) => [
      `/style_previews/${id}_1.png`,
      `/style_previews/${id}_2.png`,
      `/style_previews/${id}_3.png`
  ];

  const styles = [
    // --- REALISMO & CINEMÁTICO ---
    { 
      id: 'realistic', 
      category: 'cinematic',
      name: 'Fotorealista', 
      image: '/style_previews/realistic_1.png', 
      icon: '📸', 
      desc: 'Alta fidelidad, 8k, RAW',
      details: 'Estilo fotografía pura. Lentes 85mm, iluminación natural.'
    },
    { 
      id: 'cinematic', 
      category: 'cinematic',
      name: 'Cinemático', 
      image: '/style_previews/cinematic_1.png', 
      icon: '🎬', 
      desc: 'Hollywood, Color Grading',
      details: 'Teal & Orange, anamórfico, profundidad de campo, dramático.'
    },
    { 
      id: 'documentary', 
      category: 'cinematic',
      name: 'Documental', 
      image: '/style_previews/documentary_1.png', 
      icon: '🌍', 
      desc: 'NatGeo, BBC Earth',
      details: 'Realismo crudo, luz natural, texturas detalladas, observacional.'
    },
    { 
      id: 'b&w_noir', 
      category: 'cinematic',
      name: 'Film Noir B&W', 
      image: '/style_previews/b&w_noir_1.png', 
      icon: '📼', 
      desc: 'Alto contraste, años 40',
      details: 'Luces y sombras duras, misterio, humo, siluetas.'
    },
    { 
      id: 'drone', 
      category: 'cinematic',
      name: 'Aéreo / Drone', 
      image: '/style_previews/drone_1.png', 
      icon: '🚁', 
      desc: 'Vista de pájaro, gran escala',
      details: 'Paisajes épicos, tomas cenitales, majestuoso.'
    },

    // --- ANIME & MANGA ---
    { 
      id: 'ghibli', 
      category: 'anime',
      name: 'Studio Ghibli', 
      image: '/style_previews/ghibli_1.png', 
      icon: '🍃', 
      desc: 'Miyazaki, Tradicional',
      details: 'Colores vibrantes, naturaleza exuberante, nubes detalladas, nostálgico.'
    },
    { 
      id: 'makoto', 
      category: 'anime',
      name: 'Makoto Shinkai', 
      image: '/style_previews/makoto_1.png', 
      icon: '🌇', 
      desc: 'Your Name, Hiper-detalle',
      details: 'Iluminación mágica, destellos, cielos estrellados, ultra detallado.'
    },
    { 
      id: 'akira', 
      category: 'anime',
      name: 'Retro 80s / Akira', 
      image: '/style_previews/akira_1.png', 
      icon: '🏍️', 
      desc: 'Cyberpunk clásico, Cel',
      details: 'Dibujado a mano, estética sucia, neones, metrópolis detallada.'
    },
    { 
      id: 'kawaii', 
      category: 'anime',
      name: 'Anime Moderno', 
      image: '/style_previews/kawaii_1.png', 
      icon: '✨', 
      desc: 'Shonen / Shojo actual',
      details: 'Líneas limpias, colores saturados, ojos grandes, estilo TV actual.'
    },
    { 
      id: 'manga', 
      category: 'anime',
      name: 'Manga B&W', 
      image: '/style_previews/manga_1.png', 
      icon: '✒️', 
      desc: 'Tinta, Tramas, Papel',
      details: 'Blanco y negro, tramas de puntos, líneas de acción, entintado.'
    },

    // --- ARTE CLÁSICO ---
    { 
      id: 'watercolor', 
      category: 'art',
      name: 'Acuarela', 
      image: '/style_previews/watercolor_1.png', 
      icon: '🎨', 
      desc: 'Suave, Fluido, Artístico',
      details: 'Manchas de color, papel texturizado, bordes difusos, etéreo.'
    },
    { 
      id: 'oil', 
      category: 'art',
      name: 'Óleo Impresionista', 
      image: '/style_previews/oil_1.png', 
      icon: '🖼️', 
      desc: 'Van Gogh, Monet',
      details: 'Pinceladas visibles, textura empastada, luz vibrante.'
    },
    { 
      id: 'surreal', 
      category: 'art',
      name: 'Surrealismo', 
      image: '/style_previews/surreal_1.png', 
      icon: '🕰️', 
      desc: 'Dalí, Magritte',
      details: 'Onírico, objetos imposibles, paisajes desolados, misterioso.'
    },
    { 
      id: 'ukiyo', 
      category: 'art',
      name: 'Ukiyo-e Japonés', 
      image: '/style_previews/ukiyo_1.png', 
      icon: '🌊', 
      desc: 'Hokusai, Grabado',
      details: 'Estilo "La Gran Ola", líneas planas, colores tradicionales.'
    },
    { 
      id: 'renaissance', 
      category: 'art',
      name: 'Renacimiento', 
      image: '/style_previews/renaissance_1.png', 
      icon: '🏛️', 
      desc: 'Da Vinci, Michelangelo',
      details: 'Composición clásica, claroscuro, anatomía idealizada, divino.'
    },

    // --- DIGITAL & 3D ---
    { 
      id: '3d', 
      category: 'digital',
      name: '3D Pixar/Disney', 
      image: '/style_previews/3d_1.png', 
      icon: '🧊', 
      desc: 'CGI, Render Clean',
      details: 'Iluminación global, formas suaves, colores brillantes, amigable.'
    },
    { 
      id: 'cyberpunk', 
      category: 'digital',
      name: 'Cyberpunk 2077', 
      image: '/style_previews/cyberpunk_1.png', 
      icon: '🌃', 
      desc: 'Neon, Lluvia, Futuro',
      details: 'Alta tecnología, baja vida. Cromados, luces de neón, noche.'
    },
    { 
      id: 'lowpoly', 
      category: 'digital',
      name: 'Low Poly', 
      image: '/style_previews/lowpoly_1.png', 
      icon: '🔷', 
      desc: 'Minimalista, Geométrico',
      details: 'Polígonos visibles, colores planos, estilo videojuego indie.'
    },
    { 
      id: 'unreal', 
      category: 'digital',
      name: 'Unreal Engine 5', 
      image: '/style_previews/unreal_1.png', 
      icon: '🎮', 
      desc: 'Next-Gen Game',
      details: 'Ray tracing, texturas 4k, realismo digital extremo.'
    },
    { 
      id: 'pixel', 
      category: 'digital',
      name: 'Pixel Art', 
      image: '/style_previews/pixel_1.png', 
      icon: '👾', 
      desc: '8-bit / 16-bit',
      details: 'Retro gaming, sprites, paleta de colores limitada.'
    },
    { 
      id: 'clay', 
      category: 'digital',
      name: 'Claymation', 
      image: '/style_previews/clay_1.png', 
      icon: '🗿', 
      desc: 'Aardman, Stop Motion',
      details: 'Plastilina, texturas táctiles, iluminación de estudio pequeña.'
    },

    // --- CÓMICS ---
    { 
      id: 'comic', 
      category: 'comic',
      name: 'Cómic Moderno', 
      image: '/style_previews/comic_1.png', 
      icon: '💥', 
      desc: 'Marvel/DC Actual',
      details: 'Color digital, líneas dinámicas, acción.'
    },
    { 
      id: 'kirby', 
      category: 'comic',
      name: 'Jack Kirby', 
      image: '/style_previews/kirby_1.png', 
      icon: '⚡', 
      desc: 'Retro Marvel Bold',
      details: 'Kirby Krackle, poses exageradas, colores primarios, años 60/70.'
    },
    { 
      id: 'noir', 
      category: 'comic',
      name: 'Sin City / Noir', 
      image: '/style_previews/noir_1.png', 
      icon: '🕵️', 
      desc: 'Frank Miller Style',
      details: 'Alto contraste B&N, acentos rojos, sombras sólidas.'
    },
    { 
      id: 'moebius', 
      category: 'comic',
      name: 'Moebius', 
      image: '/style_previews/moebius_1.png', 
      icon: '🌵', 
      desc: 'Sci-Fi Francés',
      details: 'Líneas finas, colores pastel, mundos alienígenas surrealistas.'
    },

    // --- VINTAGE & RETRO ---
    { 
      id: 'retro', 
      category: 'retro',
      name: 'VHS 90s', 
      image: '/style_previews/retro_1.png', 
      icon: '📼', 
      desc: 'Glitch & Noise',
      details: 'Aberración cromática, scanlines, baja resolución, home video.'
    },
    { 
      id: 'polaroid', 
      category: 'retro',
      name: 'Polaroid', 
      image: '/style_previews/polaroid_1.png', 
      icon: '📷', 
      desc: 'Instantánea Vintage',
      details: 'Colores lavados, flash directo, viñeteado, nostálgico.'
    },
    { 
      id: 'vaporwave', 
      category: 'retro',
      name: 'Vaporwave', 
      image: '/style_previews/vaporwave_1.png', 
      icon: '🌴', 
      desc: 'Aesthetics 80s/90s',
      details: 'Rosa y cian, estatuas griegas, delfines, surrealismo digital retro.'
    },
    { 
      id: 'rubberhose', 
      category: 'retro',
      name: 'Cartoons 1930s', 
      image: '/style_previews/rubberhose_1.png', 
      icon: '🎪', 
      desc: 'Cuphead / Disney Old',
      details: 'Rubber hose, blanco y negro, granulosidad, animación de manguera.'
    }
  ];

  const filteredStyles = selectedCategory === 'all' 
    ? styles 
    : styles.filter(s => s.category === selectedCategory);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Parse duration (e.g., "60s" -> 60)
      const durationSec = parseInt(formData.duration) || 60;

      const brief = {
        title: formData.title,
        goal: formData.description,
        format: formData.format,
        targetDurationSec: durationSec,
        blueprint: 'narrative', // Default for now, could be added to UI
        visualStyle: formData.style,
        languages: [formData.language],
        voice: { [formData.language]: { voiceId: formData.voice } },
        noTextInImages: true // Default V2 constraint
      };

      const packageData = await api.ai.generateFullProject(brief);
      setFullProject(packageData);

      // Map V2 SceneMap to V1 UI format for display
      const mappedScenes = packageData.sceneMap.map((seg: any, index: number) => {
        // Try to find the detailed prompt from promptCards
        const detailedPrompt = packageData.promptCards?.find((p: any) => p.segmentId === seg.id);
        
        return {
          scene: index + 1,
          duration: `${seg.endSec - seg.startSec}s`,
          visual: detailedPrompt ? detailedPrompt.finalPositivePrompt : seg.visualIntent,
          audio: seg.narration
        };
      });

      setScriptData(mappedScenes);
      setStep(2);
    } catch (error) {
      console.error("Project generation failed:", error);
      alert("No se pudo generar el proyecto (V2). Verifica la consola del backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateProject = async () => {
    if (!formData.title) return alert('Por favor ingresa un título');
    
    setIsCreating(true);
    try {
      const selectedStyle = styles.find(s => s.id === formData.style);
      await api.projects.create({
        name: formData.title,
        type: 'Video ' + formData.format,
        duration: formData.duration,
        status: 'Draft',
        thumbnail: selectedStyle ? selectedStyle.image : '' 
      });
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error al crear el proyecto');
    } finally {
      setIsCreating(false);
    }
  };

  const formats = [
    { id: '16:9', label: 'YouTube', icon: Monitor, dims: '1920x1080' },
    { id: '9:16', label: 'Shorts/Reels', icon: Smartphone, dims: '1080x1920' },
    { id: '1:1', label: 'Square', icon: Square, dims: '1080x1080' }
  ];

  const durations = ['15s', '30s', '60s', '90s'];

  const handleDownloadScript = () => {
    if (!fullProject) return;
    
    let content = `PROJECT: ${formData.title}\n`;
    content += `GOAL: ${formData.description}\n`;
    content += `STYLE: ${formData.style}\n`;
    content += `VOICE INSTRUCTIONS: ${fullProject.voiceStyleInstructions || 'N/A'}\n\n`;
    content += `--- SCRIPT ---\n\n`;

    scriptData.forEach((scene) => {
        content += `[SCENE ${scene.scene}] (${scene.duration})\n`;
        content += `VISUAL: ${scene.visual}\n`;
        content += `AUDIO: ${scene.audio}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateVisuals = async () => {
      if (!fullProject) return;
      setIsGeneratingVisuals(true);
      try {
          const updatedPackage = await api.ai.generateVisuals(fullProject);
          setFullProject(updatedPackage);
          
          // Re-map to UI format, now using imageUrl if available
          const mappedScenes = updatedPackage.sceneMap.map((seg: any, index: number) => {
            const detailedPrompt = updatedPackage.promptCards?.find((p: any) => p.segmentId === seg.id);
            return {
              scene: index + 1,
              duration: `${seg.endSec - seg.startSec}s`,
              visual: detailedPrompt ? detailedPrompt.finalPositivePrompt : seg.visualIntent,
              audio: seg.narration,
              imageUrl: seg.imageUrl,
              audioUrl: seg.audioUrl
            };
          });
          setScriptData(mappedScenes);

      } catch (error) {
          console.error("Visuals generation failed:", error);
          alert("Error generando visuales con Nano Banana Pro.");
      } finally {
          setIsGeneratingVisuals(false);
      }
  };

  const handleGenerateAudio = async () => {
      console.log("Starting Audio Generation...");
      if (!fullProject) return;
      setIsGeneratingAudio(true);
      try {
          const updatedPackage = await api.ai.generateAudio(fullProject);
          console.log("Audio Generation Response:", updatedPackage);
          
          if (updatedPackage.fullAudioUrl) {
              console.log("Full Audio URL received. Length:", updatedPackage.fullAudioUrl.length);
          } else {
              console.warn("No fullAudioUrl in response");
          }

          setFullProject(updatedPackage);
          
          // Script data remains the same (scenes didn't change), just updated package
          // But we can trigger a re-render or notification
      } catch (error) {
          console.error("Audio generation failed:", error);
          alert("Error generando voces con Gemini TTS.");
      } finally {
          setIsGeneratingAudio(false);
      }
  };

  console.log("Render: fullProject.fullAudioUrl present?", !!fullProject?.fullAudioUrl);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#0E0E10]">
          <div>
            <h2 className="text-xl font-light text-white">Nuevo Proyecto</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-colors ${step === 1 ? 'bg-primary-600 text-white' : 'bg-primary-900/40 text-primary-400'}`}>1</span>
              <span className={`text-sm font-medium transition-colors ${step === 1 ? 'text-white' : 'text-gray-500'}`}>Objetivo</span>
              
              <div className="w-8 h-px bg-white/10 mx-2"></div>
              
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-colors ${step === 2 ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-500'}`}>2</span>
              <span className={`text-sm font-medium transition-colors ${step === 2 ? 'text-white' : 'text-gray-500'}`}>Guion & Estructura</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
            <div className="absolute inset-0 z-50 bg-[#09090b]/90 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-light text-white animate-pulse">Generando Estructura con IA...</h3>
                <p className="text-gray-500 text-sm mt-2">Analizando estilo {formData.style} y duración {formData.duration}</p>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b]">
          
          {step === 1 ? (
            /* STEP 1: DEFINITION */
            <div className="p-8 space-y-8">
                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Título del Proyecto</label>
                        <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ej: Campaña Verano 2024 - Teaser"
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Descripción / Objetivo</label>
                        <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="¿Qué quieres conseguir con este vídeo? (Borrador de ideas)"
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 transition-colors h-24 resize-none"
                        />
                    </div>
                    </div>
                </div>

                <div className="h-px w-full bg-white/5"></div>

                {/* Section 2: Technical Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Format */}
                    <div>
                    <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Formato</label>
                    <div className="grid grid-cols-3 gap-3">
                        {formats.map((fmt) => (
                        <button
                            key={fmt.id}
                            onClick={() => setFormData({...formData, format: fmt.id})}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            formData.format === fmt.id 
                                ? 'bg-primary-600/10 border-primary-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
                                : 'bg-[#18181b] border-white/5 text-gray-400 hover:border-white/20 hover:bg-[#202025]'
                            }`}
                        >
                            <fmt.icon size={24} className="mb-2" />
                            <span className="text-xs font-medium">{fmt.label}</span>
                            <span className="text-[9px] text-gray-500 mt-0.5">{fmt.dims}</span>
                        </button>
                        ))}
                    </div>
                    </div>

                    {/* Duration */}
                    <div>
                    <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Duración Estimada</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {durations.map((dur) => (
                        <button
                            key={dur}
                            onClick={() => setFormData({...formData, duration: dur})}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            formData.duration === dur
                                ? 'bg-primary-600 text-white border-primary-500'
                                : 'bg-[#18181b] border-white/5 text-gray-400 hover:text-white'
                            }`}
                        >
                            {dur}
                        </button>
                        ))}
                        <input 
                        type="text" 
                        placeholder="Custom"
                        className="w-20 bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-white/20"
                        />
                    </div>
                    </div>
                </div>

                <div className="h-px w-full bg-white/5"></div>

                {/* Section 3: Style & Audio */}
                <div>
                    <div className="flex justify-between items-end mb-3">
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Estilo de Imagen</label>
                        <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 h-[420px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                    {filteredStyles.map((style) => (
                        <button
                        key={style.id}
                        onClick={() => setFormData({...formData, style: style.id})}
                        className={`group relative h-48 rounded-xl border overflow-hidden text-left transition-all ${
                            formData.style === style.id
                            ? 'border-primary-500 ring-2 ring-primary-500 scale-[1.02] z-10 shadow-2xl shadow-primary-900/50'
                            : 'border-white/5 hover:border-white/20 hover:scale-[1.01]'
                        }`}
                        >
                        {/* Background Image */}
                        <img 
                            src={style.image} 
                            alt={style.name} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                        />
                        
                        {/* Overlay Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity`}></div>
                        
                        {/* Content */}
                        <div className="absolute inset-0 p-3 flex flex-col justify-end">
                            <div className="mb-auto flex justify-between items-start">
                                <span className="text-2xl drop-shadow-md transform group-hover:-translate-y-1 transition-transform duration-300">{style.icon}</span>
                                {formData.style === style.id ? (
                                    <div className="bg-primary-600 rounded-full p-1 shadow-lg animate-in zoom-in duration-200">
                                        <Check size={12} className="text-white" />
                                    </div>
                                ) : (
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewGallery({
                                                styleId: style.id,
                                                styleName: style.name,
                                                images: getStyleImages(style.id)
                                            });
                                        }}
                                        className="bg-white/10 hover:bg-white/30 rounded-full p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer"
                                        title="Ver galería"
                                    >
                                        <Eye size={14} className="text-white" />
                                    </div>
                                )}
                            </div>
                            
                            <span className="text-sm font-bold text-white leading-tight drop-shadow-lg group-hover:text-primary-300 transition-colors">{style.name}</span>
                            <span className="text-[10px] text-gray-300 mt-0.5 font-medium drop-shadow-md line-clamp-1">{style.desc}</span>
                            
                            {/* Detailed Hover Info */}
                            <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                                <div className="pt-2 mt-2 border-t border-white/10">
                                    <p className="text-[9px] text-gray-400 leading-relaxed italic">
                                        "{style.details}"
                                    </p>
                                </div>
                            </div>
                        </div>
                        </button>
                    ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Voices */}
                    <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
                        <Mic size={14} />
                        Voz y Narración
                    </label>
                    <div className="flex gap-4">
                        <select 
                            value={formData.voice}
                            onChange={(e) => setFormData({...formData, voice: e.target.value})}
                            className="flex-1 bg-[#18181b] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                        >
                        <option value="alloy">Alloy (Neutral)</option>
                        <option value="echo">Echo (Masculino)</option>
                        <option value="shimmer">Shimmer (Femenino)</option>
                        <option value="onyx">Onyx (Profundo)</option>
                        </select>
                        <select 
                            value={formData.language}
                            onChange={(e) => setFormData({...formData, language: e.target.value})}
                            className="w-32 bg-[#18181b] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                        >
                        <option value="ES">Español</option>
                        <option value="EN">English</option>
                        <option value="FR">Français</option>
                        </select>
                    </div>
                    </div>

                    {/* Subtitles */}
                    <div>
                    <label className="flex items-center justify-between text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <Type size={14} />
                            Subtítulos
                        </div>
                        <div 
                            onClick={() => setFormData({...formData, subtitles: !formData.subtitles})}
                            className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${formData.subtitles ? 'bg-primary-600' : 'bg-gray-700'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${formData.subtitles ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                    
                    <div className={`transition-opacity ${formData.subtitles ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                        <div className="grid grid-cols-2 gap-2">
                            {['modern', 'classic', 'pop', 'minimal'].map((sub) => (
                                <button
                                key={sub}
                                onClick={() => setFormData({...formData, subtitleStyle: sub})}
                                className={`px-2 py-2 text-xs rounded border transition-all ${
                                    formData.subtitleStyle === sub
                                    ? 'bg-white/10 border-white/30 text-white'
                                    : 'bg-transparent border-white/5 text-gray-500'
                                }`}
                                >
                                {sub.charAt(0).toUpperCase() + sub.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
          ) : (
            /* STEP 2: SCRIPT */
            <div className="p-8">
                {/* Script Toolbar */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-white font-medium">Guion Generado</h3>
                        <p className="text-sm text-gray-500">Revisa y ajusta las escenas antes de crear el proyecto.</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleGenerateVisuals}
                            disabled={isGeneratingVisuals}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 border border-purple-500/50 rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50"
                        >
                            {isGeneratingVisuals ? <RefreshCw className="animate-spin" size={14} /> : <ImageIcon size={14} />}
                            {isGeneratingVisuals ? 'Generando Visuales...' : 'Generar Visuales'}
                        </button>
                        <button 
                            onClick={handleGenerateAudio}
                            disabled={isGeneratingAudio}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 border border-orange-500/50 rounded-lg shadow-[0_0_15px_rgba(234,88,12,0.3)] transition-all disabled:opacity-50"
                        >
                            {isGeneratingAudio ? <RefreshCw className="animate-spin" size={14} /> : <Mic size={14} />}
                            {isGeneratingAudio ? 'Generando Voces...' : 'Generar Voces'}
                        </button>
                        <button 
                            onClick={handleGenerate}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <RefreshCw size={14} />
                            Regenerar
                        </button>
                        <button 
                            onClick={handleDownloadScript}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Download size={14} />
                            Descargar
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                            <Save size={14} />
                            Guardar Borrador
                        </button>
                    </div>
                </div>

                {/* Voice Style Instructions */}
                {fullProject?.voiceStyleInstructions && (
                    <div className="mb-6 bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Mic size={14} />
                            Instrucciones de Voz (Global)
                        </h4>
                        <p className="text-sm text-gray-300 italic">
                            "{fullProject.voiceStyleInstructions}"
                        </p>
                    </div>
                )}

                {/* Full Audio Player */}
                {fullProject?.fullAudioUrl && (
                    <div className="mb-6 bg-orange-900/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="bg-orange-500/20 p-2 rounded-full">
                            <Mic size={20} className="text-orange-500" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Audio Completo del Proyecto</h4>
                            <audio
                                key={fullProject.fullAudioUrl}
                                controls
                                src={fullProject.fullAudioUrl}
                                className="w-full h-8"
                                preload="auto"
                                onLoadedMetadata={(e) => {
                                    console.log("Audio Metadata Loaded. Duration:", e.currentTarget.duration);
                                    console.log("Audio Source (start):", fullProject.fullAudioUrl.substring(0, 50));
                                }}
                                onError={(e) => {
                                    console.error("Audio Player Error:", e);
                                    // Decode first bytes to see format
                                    const dataUrlMatch = fullProject.fullAudioUrl.match(/^data:([^;]+);base64,(.+)$/);
                                    if (dataUrlMatch) {
                                        const mimeType = dataUrlMatch[1];
                                        const base64 = dataUrlMatch[2];
                                        const binary = atob(base64.substring(0, 40));
                                        const hex = Array.from(binary).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
                                        console.error("MIME Type:", mimeType);
                                        console.error("First bytes (hex):", hex);
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Script Table / List */}
                <div className="space-y-4">
                    {scriptData.map((scene, index) => (
                        <div key={index} className="bg-[#18181b] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all group">
                            <div className="flex gap-4">
                                {/* Scene Header Column */}
                                <div className="w-24 flex flex-col items-center justify-start border-r border-white/5 pr-4 pt-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Escena</span>
                                    <span className="text-2xl font-light text-white mb-2">{String(scene.scene).padStart(2, '0')}</span>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 text-gray-400 border border-white/5">
                                        <Clock size={10} />
                                        <span className="text-[10px] font-mono">{scene.duration}</span>
                                    </div>
                                </div>

                                {/* Content Columns */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Visual Description or Image */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-primary-400 uppercase tracking-wider">
                                            <ImageIcon size={12} />
                                            Visual
                                        </div>
                                        {scene.imageUrl ? (
                                            <div
                                                className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/10 group-hover:border-primary-500/50 transition-colors cursor-pointer"
                                                onClick={() => setFullscreenImage({url: scene.imageUrl, sceneNumber: scene.scene})}
                                            >
                                                <img
                                                    src={scene.imageUrl}
                                                    alt={`Scene ${scene.scene}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                                    <div className="text-center">
                                                        <ImageIcon size={32} className="mx-auto mb-2 text-white" />
                                                        <p className="text-xs text-white font-medium">Click para ver en tamaño completo</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-200 leading-relaxed font-light">
                                                {scene.visual}
                                            </p>
                                        )}
                                    </div>

                                    {/* Audio/Dialogue */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-green-400 uppercase tracking-wider">
                                            <Music size={12} />
                                            Audio / Voz
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed italic whitespace-pre-line">
                                            {scene.audio}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {scriptData.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No hay escenas generadas. Intenta regenerar.
                        </div>
                    )}
                </div>

                {/* Script Footer Summary */}
                <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-primary-900/10 border border-primary-500/20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Clock size={16} className="text-primary-500" />
                            <span>Duración Total: <span className="font-bold text-white">00:27</span></span>
                        </div>
                         <div className="flex items-center gap-2 text-sm text-gray-300">
                            <ImageIcon size={16} className="text-primary-500" />
                            <span>Escenas: <span className="font-bold text-white">{scriptData.length}</span></span>
                        </div>
                    </div>
                    <button className="text-xs text-primary-400 hover:text-primary-300 underline">
                        Ajustar ritmo global
                    </button>
                </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-white/5 bg-[#0E0E10] flex justify-between">
           {step === 2 ? (
               <button 
                onClick={() => setStep(1)} 
                className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
               >
                <ChevronLeft size={16} />
                Atrás
               </button>
           ) : (
                <button onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Cancelar
                </button>
           )}

           {step === 1 ? (
               <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2 group ml-auto disabled:opacity-50"
               >
                 {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />}
                 {isGenerating ? 'Generando...' : 'Generar Estructura con IA'}
                 {!isGenerating && <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
               </button>
           ) : (
               <button 
                onClick={handleCreateProject}
                disabled={isCreating}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-2 group disabled:opacity-50"
               >
                 {isCreating ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                 {isCreating ? 'Creando...' : 'Crear Proyecto'}
               </button>
           )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="absolute top-6 left-6 bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-white font-medium">Escena {String(fullscreenImage.sceneNumber).padStart(2, '0')}</p>
          </div>

          <div
            className="max-w-[95vw] max-h-[95vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenImage.url}
              alt={`Scene ${fullscreenImage.sceneNumber} - Fullscreen`}
              className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-gray-300 text-sm">Click fuera de la imagen para cerrar</p>
          </div>
        </div>
      )}

      {/* Style Gallery Modal */}
      {previewGallery && (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewGallery(null)}
        >
            <div 
                className="bg-[#09090b] border border-white/10 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-light text-white">Galería: <span className="font-bold text-primary-400">{previewGallery.styleName}</span></h3>
                        <p className="text-sm text-gray-500">Ejemplos generados con este estilo</p>
                    </div>
                    <button 
                        onClick={() => setPreviewGallery(null)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {previewGallery.images.map((img, idx) => (
                        <div key={idx} className="space-y-2 group">
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-[#18181b]">
                                <img 
                                    src={img} 
                                    alt={`${previewGallery.styleName} ${idx + 1}`} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225/18181b/333333?text=Generating...';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <span className="text-xs font-medium text-white">Variación {idx + 1}</span>
                                </div>
                            </div>
                            <p className="text-xs text-center text-gray-500">
                                {idx === 0 ? 'Paisaje / General' : idx === 1 ? 'Retrato / Personaje' : 'Detalle / Acción'}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => {
                            setFormData({...formData, style: previewGallery.styleId});
                            setPreviewGallery(null);
                        }}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Check size={16} />
                        Seleccionar este Estilo
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default NewProjectWizard;