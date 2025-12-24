import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectsPage from './components/ProjectsPage';
import NewProjectWizard from './components/NewProjectWizard';
import ProjectEditor from './components/ProjectEditor';
import MediaPage from './components/MediaPage';
import ChannelsPage from './components/ChannelsPage';
import { checkApiKey, openApiKeySelector } from './services/geminiService';
import { Project } from './types';
import { HERO_PROJECT } from './constants'; // Importing for mock data access if needed

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleOpenWizard = () => {
       setIsWizardOpen(true);
  };

  const handleOpenEditor = (project: Project | null) => {
    setEditingProject(project);
    setCurrentView('editor');
  };

  const handleCloseEditor = () => {
    setEditingProject(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex font-sans selection:bg-primary-500/30">
      
      {/* Sidebar - Hidden when in Editor Mode */}
      {currentView !== 'editor' && (
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      )}

      {/* Main Content */}
      <main className={`${currentView !== 'editor' ? 'ml-64' : 'w-full'} flex-1 min-h-screen overflow-hidden transition-all duration-300`}>
        {currentView === 'dashboard' ? (
             <div className="p-8 h-full overflow-y-auto">
                <Dashboard 
                    onNewProject={handleOpenWizard} 
                    onOpenEditor={handleOpenEditor}
                />
             </div>
        ) : currentView === 'projects' ? (
             <div className="p-8 h-full overflow-y-auto">
                <ProjectsPage 
                    onNewProject={handleOpenWizard} 
                    onOpenEditor={handleOpenEditor}
                />
             </div>
        ) : currentView === 'media' ? (
             <MediaPage />
        ) : currentView === 'channels' ? (
             <ChannelsPage />
        ) : currentView === 'editor' ? (
             <ProjectEditor 
                project={editingProject} 
                onBack={handleCloseEditor} 
             />
        ) : (
             <div className="flex items-center justify-center h-full text-gray-500">
                 Work in progress...
             </div>
        )}
      </main>

      {/* Wizard Overlay */}
      {isWizardOpen && (
        <NewProjectWizard onClose={() => setIsWizardOpen(false)} />
      )}
    </div>
  );
};

export default App;