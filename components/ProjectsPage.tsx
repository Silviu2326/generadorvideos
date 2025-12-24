import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Filter, LayoutGrid, List as ListIcon, Plus, MoreVertical, Clapperboard, AlertCircle, Loader2 } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { Project } from '../types';
import { api } from '../services/api';

const ProjectCard: React.FC<{ project: Project; onOpen: (p: Project) => void }> = ({ project, onOpen }) => {
    
    // UI Helpers based on status
    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'Editing': return 'bg-gray-800 text-gray-300 border-gray-700';
            case 'Review': return 'bg-indigo-900/50 text-indigo-300 border-indigo-500/30';
            case 'Finished': return 'bg-green-900/50 text-green-300 border-green-500/30';
            case 'Draft': return 'bg-black/50 text-gray-500 border-gray-800';
            default: return 'bg-gray-800 text-white';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'Editing': return 'EN EDICIÓN';
            case 'Review': return 'REVISIÓN';
            case 'Finished': return 'FINALIZADO';
            case 'Draft': return 'BORRADOR';
            default: return status;
        }
    };

    const getProgressColor = (status: string) => {
         switch(status) {
            case 'Review': return 'bg-green-500';
            case 'Finished': return 'bg-green-500';
            case 'Draft': return 'bg-gray-700';
            default: return 'bg-primary-600'; // Default purple
        }
    };

    return (
        <div 
            onClick={() => onOpen(project)}
            className="group bg-[#0E0E10] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 hover:bg-[#121214] transition-all duration-300 flex flex-col h-full cursor-pointer"
        >
            {/* Thumbnail Area */}
            <div className="relative aspect-video bg-[#18181b] flex items-center justify-center overflow-hidden">
                {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <Clapperboard className="text-white/10 w-12 h-12" />
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border backdrop-blur-md ${getStatusStyle(project.status)}`}>
                        {getStatusLabel(project.status)}
                    </span>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                    {project.duration || '--:--'}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-white font-medium text-base line-clamp-1 group-hover:text-primary-400 transition-colors">{project.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{project.type || 'Proyecto'} • {project.lastEdited}</p>
                    </div>
                    <button className="text-gray-500 hover:text-white" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={16} />
                    </button>
                </div>

                <div className="mt-auto pt-4">
                     <div className="flex justify-between text-[10px] mb-1.5 text-gray-400 uppercase tracking-wider font-medium">
                        <span>Progreso</span>
                        <span>{project.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
                        <div 
                            className={`h-full rounded-full ${getProgressColor(project.status)}`}
                            style={{ width: `${project.progress || 0}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                            {/* Mock Avatars */}
                            <img src={CURRENT_USER.avatar} alt="u1" className="w-6 h-6 rounded-full border border-[#0E0E10]" />
                            {project.status === 'Editing' && (
                                <img src="https://picsum.photos/id/102/100/100" alt="u2" className="w-6 h-6 rounded-full border border-[#0E0E10]" />
                            )}
                        </div>
                        <button className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                            project.status === 'Finished' 
                            ? 'border-white/10 hover:bg-white/5 text-white' 
                            : 'border-primary-500/30 text-primary-400 hover:bg-primary-500/10'
                        }`}>
                            {project.status === 'Finished' ? 'Ver' : 'Continuar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CreateProjectCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <div onClick={onClick} className="group border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-transparent hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="text-gray-400" />
            </div>
            <h3 className="text-white font-medium mb-1">Crear Nuevo Proyecto</h3>
            <p className="text-gray-500 text-xs">Comienza desde cero o una plantilla</p>
        </div>
    );
};

interface ProjectsPageProps {
    onNewProject: () => void;
    onOpenEditor: (project: Project) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNewProject, onOpenEditor }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.projects.getAll();
        setProjects(data);
      } catch (err: any) {
        console.error("Error loading projects:", err);
        setError("No se pudieron cargar los proyectos. Revisa la conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm">
                   <Clapperboard size={16} />
                   <span>Biblioteca de Vídeos</span>
                </div>
                <h1 className="text-3xl font-light text-white">Todos los Proyectos</h1>
                <p className="text-gray-500 text-sm mt-1">Gestiona y organiza tu flujo de trabajo creativo.</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="bg-[#0E0E10] border border-white/10 rounded-lg p-1 flex">
                    <button className="p-2 rounded bg-white/10 text-white"><LayoutGrid size={16} /></button>
                    <button className="p-2 rounded text-gray-500 hover:text-white"><ListIcon size={16} /></button>
                </div>
                <button 
                  onClick={onNewProject}
                  className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                    <Plus size={16} />
                    Nuevo Proyecto
                </button>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre..." 
                    className="w-full bg-[#0E0E10] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-white/20 transition-colors"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {['Fase', 'Duración', 'Estilo'].map((filter) => (
                    <button key={filter} className="flex items-center gap-2 px-3 py-2.5 bg-[#0E0E10] border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 whitespace-nowrap">
                        {filter}
                        <ChevronDown size={14} />
                    </button>
                ))}
                <div className="w-px h-full bg-white/10 mx-2"></div>
                <button className="flex items-center gap-2 px-3 py-2.5 bg-[#0E0E10] border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 whitespace-nowrap">
                    Más recientes
                    <Filter size={14} />
                </button>
            </div>
        </div>

        {/* Content */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>Cargando proyectos...</p>
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-400">
                <AlertCircle className="w-10 h-10 mb-4" />
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#0E0E10] border border-white/10 rounded hover:bg-white/5 text-white text-sm">
                    Reintentar
                </button>
            </div>
        ) : (
            <>
                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id || Math.random()} project={project} onOpen={onOpenEditor} />
                    ))}
                    <CreateProjectCard onClick={onNewProject} />
                </div>

                {/* Recently Viewed Table (Using same data for now, limiting to 5) */}
                {projects.length > 0 && (
                <div className="pt-8">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Vistos Recientemente</h3>
                    <div className="bg-[#0E0E10] border border-white/5 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] text-gray-500 font-bold uppercase">
                            <div className="col-span-6">Proyecto</div>
                            <div className="col-span-2">Fase</div>
                            <div className="col-span-2">Duración</div>
                            <div className="col-span-2 text-right">Acciones</div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {projects.slice(0, 5).map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onOpenEditor(item)}>
                                    <div className="col-span-6 flex items-center gap-4">
                                        <div className={`w-12 h-8 rounded bg-primary-900/50 border border-white/10 flex items-center justify-center`}>
                                            {item.thumbnail ? (
                                                 <img src={item.thumbnail} alt="" className="w-full h-full object-cover rounded" />
                                            ) : (
                                                <Clapperboard size={14} className="text-primary-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium">{item.name}</p>
                                            <p className="text-xs text-gray-500">Editado: {item.lastEdited}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">
                                            {item.status?.toUpperCase() || 'BORRADOR'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-xs font-mono text-gray-400">
                                        {item.duration || '--:--'}
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}
            </>
        )}
    </div>
  );
};

export default ProjectsPage;