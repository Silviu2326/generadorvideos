import React from 'react';
import { PlusCircle, Upload, LayoutGrid } from 'lucide-react';

interface QuickActionsProps {
    onNewProject: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNewProject }) => {

  return (
    <div className="flex gap-3 my-6">
      <button 
        onClick={onNewProject}
        className="flex items-center gap-2 px-4 py-3 bg-[#0E0E10] border border-white/10 rounded-lg text-white hover:bg-[#1a1a1c] hover:border-primary-500/50 transition-all duration-200 group"
      >
        <div className="p-0.5 rounded-full bg-primary-600/20 text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <PlusCircle size={18} />
        </div>
        <span className="text-sm font-medium">Nuevo vídeo</span>
      </button>

      <button className="flex items-center gap-2 px-4 py-3 bg-[#0E0E10] border border-white/10 rounded-lg text-gray-300 hover:bg-[#1a1a1c] hover:text-white transition-all duration-200">
        <Upload size={18} />
        <span className="text-sm font-medium">Importar assets</span>
      </button>

      <button className="flex items-center gap-2 px-4 py-3 bg-[#0E0E10] border border-white/10 rounded-lg text-gray-300 hover:bg-[#1a1a1c] hover:text-white transition-all duration-200">
        <LayoutGrid size={18} />
        <span className="text-sm font-medium">Explorar plantillas</span>
      </button>
    </div>
  );
};

export default QuickActions;