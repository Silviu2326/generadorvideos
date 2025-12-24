import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Play, Pause, SkipBack, SkipForward, 
  Scissors, Copy, Trash2, Layers, Music, Image as ImageIcon, 
  Type, Settings, Download, ZoomIn, ZoomOut, Volume2, VolumeX,
  Maximize, MonitorPlay, ChevronDown, ChevronRight,
  MousePointer2, Hand, Magnet, Flag, Lock, Eye, EyeOff,
  Mic, Sliders, Wand2, Grid, Undo2, Redo2, Diamond, MoreHorizontal,
  SplitSquareHorizontal, Film
} from 'lucide-react';
import { Project } from '../types';

interface ProjectEditorProps {
  project: Project | null;
  onBack: () => void;
}

interface Clip {
  id: string;
  name: string;
  start: number;
  width: number;
  color: string;
  thumb?: string;
  opacity?: number;
  waveform?: boolean;
}

interface Track {
  id: number;
  type: 'video' | 'audio';
  name: string;
  clips: Clip[];
}

// Helper for timecode formatting
const formatTimecode = (frames: number) => {
    const fps = 24;
    const hours = Math.floor(frames / (fps * 3600));
    const minutes = Math.floor((frames % (fps * 3600)) / (fps * 60));
    const seconds = Math.floor((frames % (fps * 60)) / fps);
    const f = frames % fps;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
};

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(24 * 12 + 5); // Start at 12s 05f
  const [activeTab, setActiveTab] = useState<'media' | 'audio' | 'text' | 'effects'>('media');
  const [zoomLevel, setZoomLevel] = useState(40);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('c1');
  
  // Track States
  const [trackStates, setTrackStates] = useState<Record<number, { locked: boolean, muted: boolean, hidden: boolean }>>({
      1: { locked: false, muted: false, hidden: false },
      2: { locked: false, muted: false, hidden: false },
      3: { locked: false, muted: false, hidden: false },
      4: { locked: true, muted: false, hidden: false },
  });

  // Animation Loop for Playhead
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
        interval = setInterval(() => {
            setCurrentFrame(prev => prev + 1);
        }, 1000 / 24);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleTrackState = (trackId: number, property: 'locked' | 'muted' | 'hidden') => {
      setTrackStates(prev => ({
          ...prev,
          [trackId]: { ...prev[trackId], [property]: !prev[trackId][property] }
      }));
  };

  // Mock Tracks Data
  const tracks: Track[] = [
    { id: 1, type: 'video', name: 'V1: Main Camera', clips: [
      { id: 'c1', name: 'A001_C003_Shibuya.mp4', start: 0, width: 200, color: 'bg-indigo-900/90 border-indigo-500/50', thumb: 'https://picsum.photos/seed/v1/200/50' },
      { id: 'c2', name: 'A001_C005_Crossing.mp4', start: 205, width: 150, color: 'bg-indigo-900/90 border-indigo-500/50', thumb: 'https://picsum.photos/seed/v2/200/50' },
      { id: 'c3', name: 'A002_C012_Night.mp4', start: 360, width: 280, color: 'bg-indigo-900/90 border-indigo-500/50', thumb: 'https://picsum.photos/seed/v3/200/50' }
    ]},
    { id: 2, type: 'video', name: 'V2: B-Roll / Overlay', clips: [
      { id: 'c4', name: 'Neon_Light_Leak_04.mov', start: 50, width: 120, color: 'bg-fuchsia-900/80 border-fuchsia-500/50', opacity: 0.6 },
      { id: 'c5', name: 'Lower_Third_Intro', start: 0, width: 80, color: 'bg-emerald-900/80 border-emerald-500/50' }
    ]},
    { id: 3, type: 'audio', name: 'A1: Dialogue', clips: [
      { id: 'a1', name: 'VO_Intro_Take2.wav', start: 10, width: 300, color: 'bg-teal-900/80 border-teal-500/50', waveform: true }
    ]},
    { id: 4, type: 'audio', name: 'A2: Music Bed', clips: [
      { id: 'a2', name: 'Chill_Lofi_Background.mp3', start: 0, width: 800, color: 'bg-blue-900/80 border-blue-500/50', waveform: true }
    ]}
  ];

  // Determine selected clip type for Inspector
  const selectedClipType = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId)?.waveform ? 'audio' : 'video';

  return (
    <div className="h-screen w-full bg-[#050505] flex flex-col overflow-hidden text-gray-300 font-sans selection:bg-primary-500/30">
      
      {/* ==================== 1. TOP BAR ==================== */}
      <header className="h-14 bg-[#09090b] border-b border-white/5 flex items-center justify-between px-4 z-40 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg">
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-3 border-r border-white/5 pr-6">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">CS</div>
            <div className="flex flex-col">
                 <span className="text-sm font-medium text-white leading-none tracking-tight">{project?.name || 'Sin Título'}</span>
                 <span className="text-[10px] text-gray-500 mt-1 font-mono">1920x1080 • 24fps • REC.709</span>
            </div>
          </div>

          {/* Top Menu */}
          <nav className="hidden md:flex gap-1 text-xs font-medium text-gray-400">
             {['Archivo', 'Editar', 'Recortar', 'Efectos', 'Color', 'Exportar'].map(item => (
                 <button key={item} className="px-3 py-1.5 rounded hover:bg-white/5 hover:text-white transition-colors">{item}</button>
             ))}
          </nav>
        </div>

        {/* Center: Main Timecode Display */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
             <div className="bg-[#121214] border border-white/10 rounded px-4 py-1 shadow-inner">
                 <span className="text-lg font-mono text-primary-400 font-bold tracking-[0.15em] drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                     {formatTimecode(currentFrame)}
                 </span>
             </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-0.5 bg-[#121214] rounded-lg p-0.5 border border-white/5">
             <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Deshacer"><Undo2 size={16} /></button>
             <div className="w-px h-4 bg-white/5 mx-0.5"></div>
             <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Rehacer"><Redo2 size={16} /></button>
          </div>
          <button className="bg-white text-black px-5 py-2 rounded-lg text-xs font-bold transition-all hover:bg-gray-200 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Download size={14} />
            EXPORTAR
          </button>
        </div>
      </header>


      {/* ==================== 2. MAIN WORKSPACE ==================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* --- LEFT SIDEBAR: BROWSER --- */}
        <div className="w-[320px] bg-[#09090b] border-r border-white/5 flex flex-col shrink-0 z-10">
          {/* Tabs */}
          <div className="flex items-center border-b border-white/5 bg-[#0E0E10]">
             {[
                { id: 'media', icon: Layers, label: 'Medios' },
                { id: 'effects', icon: Wand2, label: 'Efectos' },
                { id: 'text', icon: Type, label: 'Texto' },
                { id: 'transitions', icon: SplitSquareHorizontal, label: 'Trans.' },
             ].map(tab => (
                 <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex flex-col items-center justify-center py-3 gap-1.5 border-b-2 transition-all ${
                        activeTab === tab.id 
                        ? 'border-primary-500 text-white bg-white/5' 
                        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                 >
                    <tab.icon size={16} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
                 </button>
             ))}
          </div>

          {/* Browser Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#09090b]">
             {/* Search */}
             <div className="mb-4 relative group">
                <input type="text" placeholder="Buscar assets..." className="w-full bg-[#18181b] border border-white/10 rounded-lg px-3 py-2.5 pl-9 text-xs text-white focus:outline-none focus:border-primary-500/50 transition-colors" />
                <Settings size={14} className="absolute right-3 top-2.5 text-gray-500 group-hover:text-white transition-colors cursor-pointer" />
                <div className="absolute left-3 top-2.5 w-4 h-4 rounded-full border border-gray-600 group-hover:border-white transition-colors"></div>
             </div>

             {activeTab === 'media' && (
                 <div className="space-y-6">
                    <div>
                       <div className="flex items-center justify-between mb-3 px-1">
                           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                               <Film size={12} /> Master Bin
                           </h3>
                           <button className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-white transition-colors">+ Importar</button>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                           {[1,2,3,4,5,6].map(i => (
                               <div key={i} className="group relative aspect-video bg-[#18181b] rounded-lg border border-white/5 hover:border-primary-500/50 cursor-pointer overflow-hidden transition-all shadow-sm">
                                   <img src={`https://picsum.photos/seed/${i*20}/200/150`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity scale-100 group-hover:scale-105 duration-500" />
                                   <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 px-1.5 rounded text-white backdrop-blur-sm">00:04:12</span>
                               </div>
                           ))}
                       </div>
                    </div>
                 </div>
             )}

             {activeTab === 'effects' && (
                 <div className="space-y-2">
                     {['Corrección de Color', 'Desenfoque Gaussiano', 'Ruido', 'Resplandor', 'Nitidez'].map((fx, i) => (
                         <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#18181b] border border-white/5 hover:border-primary-500/30 hover:bg-[#202025] cursor-grab active:cursor-grabbing group transition-all">
                             <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center group-hover:from-primary-600 group-hover:to-indigo-700 transition-all">
                                 <Wand2 size={14} className="text-gray-400 group-hover:text-white" />
                             </div>
                             <span className="text-xs text-gray-300 font-medium group-hover:text-white">{fx}</span>
                         </div>
                     ))}
                 </div>
             )}
          </div>
        </div>

        {/* --- CENTER: PREVIEW --- */}
        <div className="flex-1 bg-[#050505] flex flex-col relative min-w-0 z-0">
          {/* Viewport Toolbar */}
          <div className="h-10 bg-[#09090b] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
             <div className="flex items-center gap-4">
                 <span className="text-xs font-bold text-white flex items-center gap-2">
                    <MonitorPlay size={14} className="text-primary-500" />
                    Program
                 </span>
                 <div className="w-px h-4 bg-white/10"></div>
                 <select className="bg-transparent text-[10px] text-gray-400 font-medium focus:outline-none hover:text-white cursor-pointer">
                     <option>Ajustar (Fit)</option>
                     <option>10%</option>
                     <option>25%</option>
                     <option>50%</option>
                     <option>100%</option>
                 </select>
             </div>
             <div className="flex items-center gap-3 text-gray-500">
                 <button title="Safe Margins" className="hover:text-white"><Grid size={14} /></button>
                 <select className="bg-transparent text-[10px] font-medium focus:outline-none hover:text-white cursor-pointer">
                     <option>Full Resolution</option>
                     <option>1/2</option>
                     <option>1/4</option>
                 </select>
             </div>
          </div>

          {/* Player Viewport */}
          <div className="flex-1 flex items-center justify-center p-8 bg-[#020202] relative overflow-hidden bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px]">
             
             {/* The Video Canvas */}
             <div className="relative aspect-video w-full max-w-4xl bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] group border border-white/5">
                 <img 
                    src="https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1280&auto=format&fit=crop" 
                    className="w-full h-full object-contain"
                 />
                 
                 {/* Quick Overlay Controls */}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     <div className="w-16 h-16 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 shadow-xl pointer-events-auto cursor-pointer hover:bg-black/60 hover:scale-105 transition-all" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause fill="white" size={24} className="text-white" /> : <Play fill="white" size={24} className="text-white ml-1" />}
                     </div>
                 </div>

                 {/* Mini Audio Overlay */}
                 <div className="absolute bottom-4 right-4 flex gap-1 h-20 pointer-events-none">
                     <div className="w-1.5 bg-black/50 rounded-full overflow-hidden flex flex-col justify-end">
                         <div className="w-full bg-green-500 transition-all duration-75" style={{ height: isPlaying ? `${Math.random() * 60 + 20}%` : '10%' }}></div>
                     </div>
                     <div className="w-1.5 bg-black/50 rounded-full overflow-hidden flex flex-col justify-end">
                         <div className="w-full bg-green-500 transition-all duration-75" style={{ height: isPlaying ? `${Math.random() * 60 + 20}%` : '10%' }}></div>
                     </div>
                 </div>
             </div>
          </div>

          {/* Transport Controls */}
          <div className="h-14 bg-[#09090b] border-t border-white/5 flex items-center justify-center gap-8 px-4 shrink-0">
             <div className="flex items-center gap-4 text-gray-400">
                 <button className="p-2 hover:text-white hover:bg-white/5 rounded-full transition-colors"><SkipBack size={18} /></button>
                 <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition-all shadow-lg ${isPlaying ? 'bg-primary-600 hover:bg-primary-500' : 'bg-white hover:bg-gray-200 text-black'}`}
                 >
                    {isPlaying ? <Pause fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} className="ml-0.5" />}
                 </button>
                 <button className="p-2 hover:text-white hover:bg-white/5 rounded-full transition-colors"><SkipForward size={18} /></button>
             </div>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: INSPECTOR --- */}
        <div className="w-[300px] bg-[#09090b] border-l border-white/5 flex flex-col shrink-0 z-10">
           <div className="flex border-b border-white/5 bg-[#0E0E10]">
              <button className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${selectedClipType === 'video' ? 'border-primary-500 text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-white'}`}>Video</button>
              <button className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${selectedClipType === 'audio' ? 'border-primary-500 text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-white'}`}>Audio</button>
              <button className="flex-1 py-3 text-xs font-bold text-gray-500 border-b-2 border-transparent hover:text-white hover:bg-white/5 transition-colors">Color</button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
              {/* Properties based on Selection */}
              {selectedClipType === 'video' ? (
                <>
                  {/* Transform Section */}
                  <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider group cursor-pointer">
                          <span className="flex items-center gap-2"><Maximize size={12} className="text-primary-500" /> Transformar</span>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                             <ChevronDown size={12} />
                          </div>
                      </div>
                      
                      <div className="space-y-4 pl-2">
                          <div className="grid grid-cols-2 gap-4">
                              {['Posición X', 'Posición Y'].map((label, idx) => (
                                  <div key={label}>
                                      <div className="flex justify-between mb-1">
                                         <label className="text-[9px] text-gray-500 uppercase font-bold">{label}</label>
                                         <Diamond size={10} className="text-gray-600 hover:text-primary-500 cursor-pointer" />
                                      </div>
                                      <div className="relative group">
                                          <input type="number" defaultValue={idx === 0 ? 960 : 540} className="w-full bg-[#18181b] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono text-right focus:border-primary-500/50 focus:outline-none transition-colors" />
                                          <span className={`absolute left-2 top-1.5 text-[10px] text-gray-600 cursor-${idx === 0 ? 'ew' : 'ns'}-resize opacity-0 group-hover:opacity-100 transition-opacity`}>{idx === 0 ? 'X' : 'Y'}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          <div>
                              <div className="flex justify-between mb-1">
                                  <label className="text-[9px] text-gray-500 uppercase font-bold">Escala</label>
                                  <Diamond size={10} className="text-primary-500 cursor-pointer fill-primary-500" />
                              </div>
                              <div className="flex items-center gap-2">
                                  <input type="range" className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 transition-colors" />
                                  <input type="number" defaultValue={100} className="w-14 bg-[#18181b] border border-white/10 rounded px-1 py-1 text-xs text-white font-mono text-right" />
                              </div>
                          </div>

                          <div>
                              <div className="flex justify-between mb-1">
                                  <label className="text-[9px] text-gray-500 uppercase font-bold">Rotación</label>
                                  <Diamond size={10} className="text-gray-600 hover:text-primary-500 cursor-pointer" />
                              </div>
                              <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer" title="Reset">
                                    <Undo2 size={10} className="text-gray-400" />
                                  </div>
                                  <input type="number" defaultValue={0} className="flex-1 bg-[#18181b] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono text-right" />
                                  <span className="text-[10px] text-gray-500">deg</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="h-px bg-white/5"></div>

                  {/* Compositing */}
                  <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider">
                          <span className="flex items-center gap-2"><Layers size={12} className="text-primary-500" /> Composición</span>
                      </div>
                      <div className="space-y-3 pl-2">
                          <div>
                              <div className="flex justify-between mb-1">
                                  <label className="text-[9px] text-gray-500 uppercase font-bold">Opacidad</label>
                                  <Diamond size={10} className="text-gray-600 hover:text-primary-500 cursor-pointer" />
                              </div>
                              <div className="flex items-center gap-2">
                                  <input type="range" className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                  <span className="text-xs font-mono text-white">100%</span>
                              </div>
                          </div>
                          <div>
                               <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Modo de Fusión</label>
                               <select className="w-full bg-[#18181b] border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none">
                                   <option>Normal</option>
                                   <option>Screen</option>
                                   <option>Multiply</option>
                                   <option>Overlay</option>
                                   <option>Soft Light</option>
                               </select>
                          </div>
                      </div>
                  </div>
                </>
              ) : (
                /* AUDIO INSPECTOR */
                <div className="space-y-4">
                     <div className="flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider">
                          <span className="flex items-center gap-2"><Volume2 size={12} className="text-primary-500" /> Volumen</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                      </div>
                      <div className="pl-2 space-y-4">
                          <div>
                              <div className="flex justify-between mb-1">
                                  <label className="text-[9px] text-gray-500 uppercase font-bold">Nivel (dB)</label>
                                  <Diamond size={10} className="text-primary-500 fill-primary-500" />
                              </div>
                              <input type="range" className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" defaultValue={80} />
                          </div>
                          <div className="flex gap-2">
                              <button className="flex-1 py-1.5 bg-[#18181b] border border-white/10 rounded text-xs text-white hover:bg-white/5">Fade In</button>
                              <button className="flex-1 py-1.5 bg-[#18181b] border border-white/10 rounded text-xs text-white hover:bg-white/5">Fade Out</button>
                          </div>
                      </div>
                </div>
              )}

              {/* AI Enhancements Box */}
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#1E1B4B] to-[#312E81] border border-primary-500/30 mt-4 shadow-lg">
                  <h4 className="text-[10px] font-bold text-primary-300 uppercase mb-3 flex items-center gap-1.5">
                      <Wand2 size={12} /> AI Magic Tools
                  </h4>
                  <div className="space-y-2">
                      <button className="w-full flex items-center justify-between px-3 py-2 rounded bg-black/20 hover:bg-black/40 text-xs text-gray-200 transition-colors border border-white/5">
                          <span>{selectedClipType === 'video' ? 'Eliminar Fondo' : 'Limpiar Ruido'}</span>
                          <ChevronRight size={12} />
                      </button>
                      <button className="w-full flex items-center justify-between px-3 py-2 rounded bg-black/20 hover:bg-black/40 text-xs text-gray-200 transition-colors border border-white/5">
                          <span>{selectedClipType === 'video' ? 'Estabilizar Video' : 'Mejorar Voz'}</span>
                          <ChevronRight size={12} />
                      </button>
                  </div>
              </div>
           </div>
        </div>

      </div>


      {/* ==================== 3. TIMELINE ==================== */}
      <div className="h-[340px] bg-[#0E0E10] border-t border-white/5 flex flex-col shrink-0 relative shadow-[0_-5px_20px_rgba(0,0,0,0.3)] z-20">
        
        {/* Timeline Toolbar */}
        <div className="h-10 bg-[#121214] border-b border-white/5 flex items-center justify-between px-2 shrink-0">
           <div className="flex items-center gap-1">
               <button className="p-1.5 bg-primary-600 text-white rounded shadow-sm"><MousePointer2 size={14} /></button>
               <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"><Scissors size={14} /></button>
               <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"><Hand size={14} /></button>
               <div className="w-px h-4 bg-white/10 mx-1"></div>
               <button className="p-1.5 text-primary-400 bg-primary-900/20 rounded border border-primary-500/20"><Magnet size={14} /></button>
               <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded"><Flag size={14} /></button>
           </div>

           <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-[#09090b] rounded px-2 py-0.5 border border-white/5">
                   <ZoomOut size={12} className="text-gray-500 cursor-pointer hover:text-white" onClick={() => setZoomLevel(Math.max(10, zoomLevel - 10))} />
                   <div className="w-20 h-1 bg-gray-800 rounded-full">
                       <div className="h-full bg-gray-500 rounded-full" style={{ width: `${zoomLevel}%` }}></div>
                   </div>
                   <ZoomIn size={12} className="text-gray-500 cursor-pointer hover:text-white" onClick={() => setZoomLevel(Math.min(100, zoomLevel + 10))} />
               </div>
           </div>
        </div>

        {/* Time Ruler */}
        <div className="h-6 bg-[#09090b] border-b border-white/5 flex items-end relative overflow-hidden shrink-0 select-none cursor-pointer"
             onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left - 160; // offset
                 // Logic to set currentFrame based on click position would go here
             }}
        >
             <div className="absolute inset-0 flex items-end pb-1 pl-[160px]"> {/* Offset for track headers */}
                 {Array.from({ length: 20 }).map((_, i) => (
                     <div key={i} className="flex-1 border-l border-white/10 h-2 flex flex-col justify-end pl-1 relative group hover:bg-white/5 transition-colors">
                         <span className="text-[9px] font-mono text-gray-500 absolute -top-3 left-1 group-hover:text-white">00:0{i}</span>
                         <div className="flex justify-between w-full pr-1">
                             <div className="h-1 w-px bg-white/5"></div>
                             <div className="h-1 w-px bg-white/5"></div>
                             <div className="h-1 w-px bg-white/5"></div>
                             <div className="h-1 w-px bg-white/5"></div>
                         </div>
                     </div>
                 ))}
             </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#09090b] relative flex">
            
            {/* Playhead (Animated) */}
            <div 
                className="absolute top-0 bottom-0 w-px bg-red-500 z-50 pointer-events-none transition-all duration-75 ease-linear shadow-[0_0_10px_red]"
                style={{ left: `${350 + (currentFrame % 400)}px` }} // Simulating movement
            >
                 <div className="absolute -top-3 -left-1.5 w-3 h-3 bg-red-500 rotate-45 transform rounded-sm shadow-md"></div>
            </div>

            {/* Track Headers & Lanes Container */}
            <div className="flex-1 min-w-max pb-8">
               {tracks.map((track) => (
                   <div key={track.id} className="flex border-b border-white/5 group bg-[#0c0c0e]">
                       {/* Track Header */}
                       <div className="w-[160px] border-r border-white/5 bg-[#121214] flex flex-col justify-center px-3 py-2 shrink-0 z-20 sticky left-0 shadow-[2px_0_10px_rgba(0,0,0,0.3)]">
                           <div className="flex items-center justify-between mb-1.5">
                               <span className={`text-[10px] font-bold uppercase tracking-wider ${track.type === 'video' ? 'text-blue-400' : 'text-green-400'}`}>
                                   {track.name.split(':')[0]}
                               </span>
                               <MoreHorizontal size={12} className="text-gray-600 cursor-pointer hover:text-white" />
                           </div>
                           <div className="flex gap-1.5">
                               <button 
                                onClick={() => toggleTrackState(track.id, 'locked')}
                                className={`p-1 rounded text-[9px] font-bold border transition-colors ${trackStates[track.id].locked ? 'bg-red-900/30 text-red-400 border-red-500/30' : 'bg-[#1a1a1c] text-gray-500 border-transparent hover:text-white'}`}
                                title="Lock Track"
                               >
                                  {trackStates[track.id].locked ? <Lock size={10} /> : <Lock size={10} className="opacity-50" />}
                               </button>
                               <button 
                                onClick={() => toggleTrackState(track.id, 'hidden')}
                                className="p-1 rounded text-[9px] font-bold border bg-[#1a1a1c] text-gray-500 border-transparent hover:text-white transition-colors"
                               >
                                  {track.type === 'video' ? <Eye size={10} /> : <Volume2 size={10} />}
                               </button>
                               <div className="w-px h-full bg-white/5 mx-0.5"></div>
                               <button 
                                onClick={() => toggleTrackState(track.id, 'muted')}
                                className={`w-5 flex items-center justify-center rounded text-[9px] font-bold border transition-colors ${trackStates[track.id].muted ? 'bg-orange-500 text-white border-orange-600' : 'bg-[#1a1a1c] text-gray-500 border-transparent hover:text-white'}`}
                               >
                                   M
                               </button>
                               <button className="w-5 flex items-center justify-center rounded text-[9px] font-bold border bg-[#1a1a1c] text-gray-500 border-transparent hover:text-white hover:bg-green-900/30 hover:text-green-400 transition-colors">S</button>
                           </div>
                       </div>

                       {/* Track Lane */}
                       <div className="flex-1 relative h-[68px] bg-[#09090b] bg-[linear-gradient(90deg,#ffffff03_1px,transparent_1px)] [background-size:20px_100%] min-w-[1200px]">
                           {track.clips.map((clip) => {
                               const isSelected = selectedClipId === clip.id;
                               return (
                                   <div 
                                      key={clip.id}
                                      onClick={(e) => { e.stopPropagation(); setSelectedClipId(clip.id); }}
                                      className={`absolute top-1 bottom-1 rounded-md border overflow-hidden cursor-move group/clip shadow-md transition-all ${clip.color} ${isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/20 z-10' : 'opacity-90 hover:opacity-100'}`}
                                      style={{ left: `${clip.start}px`, width: `${clip.width}px` }}
                                   >
                                      {/* Clip Content */}
                                      <div className="w-full h-full relative">
                                          {/* Video Thumbs */}
                                          {track.type === 'video' && clip.thumb && (
                                             <div className="absolute inset-0 flex opacity-40 grayscale group-hover/clip:grayscale-0 transition-all">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <img key={i} src={clip.thumb} className="h-full object-cover flex-1 border-r border-white/10" />
                                                ))}
                                             </div>
                                          )}
                                          
                                          {/* Audio Waveform */}
                                          {track.type === 'audio' && clip.waveform && (
                                              <div className="absolute inset-0 flex items-center justify-center opacity-50 px-1">
                                                 <div className="w-full h-2/3 flex items-center gap-px">
                                                     {Array.from({ length: 50 }).map((_, i) => (
                                                         <div key={i} className={`flex-1 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-300'}`} style={{ height: `${Math.random() * 100}%` }}></div>
                                                     ))}
                                                 </div>
                                              </div>
                                          )}

                                          {/* Label & Handles */}
                                          <div className="absolute inset-0 p-1.5 flex flex-col justify-between">
                                              <div className="flex items-center gap-1.5 z-20">
                                                  <span className={`text-[10px] font-bold truncate drop-shadow-md mix-blend-difference ${isSelected ? 'text-white' : 'text-gray-100'}`}>{clip.name}</span>
                                              </div>
                                          </div>
                                          
                                          {/* Fade Handles (Hover only) */}
                                          <div className="absolute top-0 left-0 w-3 h-3 bg-white/30 hover:bg-white rounded-br opacity-0 group-hover/clip:opacity-100 transition-opacity cursor-e-resize z-30"></div>
                                          <div className="absolute top-0 right-0 w-3 h-3 bg-white/30 hover:bg-white rounded-bl opacity-0 group-hover/clip:opacity-100 transition-opacity cursor-w-resize z-30"></div>
                                      </div>
                                   </div>
                               );
                           })}
                       </div>
                   </div>
               ))}
            </div>

            {/* Right Side Audio Meters (Sticky) */}
            <div className="w-12 bg-[#0E0E10] border-l border-white/5 sticky right-0 flex gap-2 justify-center py-4 z-30 h-full shadow-[-5px_0_10px_rgba(0,0,0,0.2)]">
                 <div className="w-1.5 bg-[#1a1a1c] rounded-full overflow-hidden flex flex-col justify-end">
                     {/* Bouncing Bar */}
                     <div className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-75" 
                          style={{ height: isPlaying ? `${Math.random() * 40 + 30}%` : '0%' }}></div>
                 </div>
                 <div className="w-1.5 bg-[#1a1a1c] rounded-full overflow-hidden flex flex-col justify-end">
                     <div className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-75" 
                          style={{ height: isPlaying ? `${Math.random() * 40 + 30}%` : '0%' }}></div>
                 </div>
                 <div className="absolute bottom-2 text-[8px] font-mono text-gray-500">
                    LR
                 </div>
            </div>
        </div>

      </div>

    </div>
  );
};

export default ProjectEditor;