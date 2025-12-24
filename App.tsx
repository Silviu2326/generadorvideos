import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectsPage from './components/ProjectsPage';
import NewProjectWizard from './components/NewProjectWizard';
import { ProjectEditor } from './src/features/editor';
import MediaPage from './components/MediaPage';
import ChannelsPage from './components/ChannelsPage';
import { Project } from './types';

const AppContent: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenWizard = () => {
       setIsWizardOpen(true);
  };

  const handleOpenEditor = (project: Project | null) => {
    setEditingProject(project);
    navigate('/editor');
  };

  const handleCloseEditor = () => {
    setEditingProject(null);
    navigate('/');
  };

  const isEditor = location.pathname === '/editor';

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex font-sans selection:bg-primary-500/30">
      
      {/* Sidebar - Hidden when in Editor Mode */}
      {!isEditor && (
        <Sidebar />
      )}

      {/* Main Content */}
      <main className={`${!isEditor ? 'ml-64' : 'w-full'} flex-1 min-h-screen overflow-hidden transition-all duration-300`}>
        <Routes>
            <Route path="/" element={
                 <div className="p-8 h-full overflow-y-auto">
                    <Dashboard 
                        onNewProject={handleOpenWizard} 
                        onOpenEditor={handleOpenEditor}
                    />
                 </div>
            } />
            <Route path="/projects" element={
                 <div className="p-8 h-full overflow-y-auto">
                    <ProjectsPage 
                        onNewProject={handleOpenWizard} 
                        onOpenEditor={handleOpenEditor}
                    />
                 </div>
            } />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/channels" element={<ChannelsPage />} />
            <Route path="/editor" element={
                 <ProjectEditor 
                    project={editingProject} 
                    onBack={handleCloseEditor} 
                 />
            } />
        </Routes>
      </main>

      {/* Wizard Overlay */}
      {isWizardOpen && (
        <NewProjectWizard onClose={() => setIsWizardOpen(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;