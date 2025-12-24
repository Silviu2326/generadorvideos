import React from 'react';
import Header from './Header';
import HeroProject from './HeroProject';
import QuickActions from './QuickActions';
import RecentProjects from './RecentProjects';
import Reminders from './Reminders';
import { Project } from '../types';

interface DashboardProps {
    onNewProject: () => void;
    onOpenEditor: (project: Project | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewProject, onOpenEditor }) => {
  return (
    <div className="max-w-6xl mx-auto">
        <Header />
        
        <HeroProject onOpen={onOpenEditor} />
        
        <QuickActions onNewProject={onNewProject} />

        <div className="flex flex-col lg:flex-row gap-6">
            <RecentProjects onOpen={onOpenEditor} />
            <Reminders />
        </div>
    </div>
  );
};

export default Dashboard;