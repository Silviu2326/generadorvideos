import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { api } from '../services/api';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let colors = "";
    switch(status) {
        case 'Editing': colors = "bg-blue-500/10 text-blue-400 border-blue-500/20"; break;
        case 'Rendering': colors = "bg-green-500/10 text-green-400 border-green-500/20"; break;
        case 'Post-Prod': colors = "bg-purple-500/10 text-purple-400 border-purple-500/20"; break;
        default: colors = "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${colors}`}>
            {status === 'Editing' ? 'Edición' : status}
        </span>
    );
}

interface RecentProjectsProps {
    onOpen?: (project: Project) => void;
}

const RecentProjects: React.FC<RecentProjectsProps> = ({ onOpen }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.projects.getAll();
        setProjects(data.slice(0, 5)); // Show only recent 5
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="flex-1 bg-[#0E0E10] border border-white/5 rounded-2xl p-6 min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-light text-gray-200">Proyectos Recientes</h3>
        <button className="text-xs font-medium text-primary-500 hover:text-primary-400">Ver todos</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Nombre</th>
                    <th className="pb-3">Fase</th>
                    <th className="pb-3 text-right pr-2">Editado</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {projects.map((project) => (
                    <tr 
                        key={project.id} 
                        className="group hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => onOpen && onOpen(project)}
                    >
                        <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                                {project.thumbnail && <img src={project.thumbnail} alt="" className="w-8 h-8 rounded-md object-cover opacity-80 group-hover:opacity-100" />}
                                <span className="text-sm text-gray-300 font-medium group-hover:text-white">{project.name}</span>
                            </div>
                        </td>
                        <td className="py-4">
                            <StatusBadge status={project.status} />
                        </td>
                        <td className="py-4 text-right pr-2 text-xs text-gray-500">
                            {project.lastEdited}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentProjects;