import React from 'react';
import { HERO_PROJECT } from '../constants';
import { Play, MoreHorizontal, Eye } from 'lucide-react';
import { Project } from '../types';

interface HeroProjectProps {
    onOpen?: (project: Project) => void;
}

const HeroProject: React.FC<HeroProjectProps> = ({ onOpen }) => {
  const handleClick = () => {
      if (onOpen) onOpen(HERO_PROJECT);
  };

  return (
    <div className="w-full bg-[#0E0E10] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:border-white/10 transition-colors duration-300">
      {/* Thumbnail / Preview Area */}
      <div 
        onClick={handleClick}
        className="relative w-full md:w-[320px] aspect-video rounded-xl overflow-hidden group cursor-pointer"
      >
        <img 
            src="https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1000&auto=format&fit=crop" 
            alt="Project Preview" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-200">
                <Play fill="white" className="text-white ml-1" size={20} />
            </div>
        </div>

        <span className="absolute bottom-3 left-3 text-xs font-mono text-white/80">04:23 / 12:00</span>
      </div>

      {/* Details Area */}
      <div className="flex-1 flex flex-col justify-between py-1 pr-2">
        <div>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-900/40 text-primary-400 border border-primary-500/20 uppercase tracking-wider">
                        En Guion
                    </span>
                    <span className="text-xs text-gray-500">{HERO_PROJECT.lastEdited}</span>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <h3 className="text-2xl font-light text-white mb-1">
                Vlog de Viaje: <span className="font-medium">Japón 2024</span>
            </h3>
            <p className="text-gray-400 text-sm mb-6">Episodio 3: Explorando las calles de Shibuya de noche.</p>

            <div className="mb-6">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Progreso</span>
                    <span className="text-primary-400 font-bold">{HERO_PROJECT.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                        style={{ width: `${HERO_PROJECT.progress}%` }}
                    ></div>
                </div>
            </div>
        </div>

        <div className="flex gap-3">
            <button 
                onClick={handleClick}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] flex items-center gap-2"
            >
                <Play size={16} fill="currentColor" />
                Continuar
            </button>
            <button className="px-6 py-2.5 bg-transparent border border-white/10 hover:border-white/30 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                <Eye size={16} />
                Previsualizar
            </button>
        </div>
      </div>
    </div>
  );
};

export default HeroProject;