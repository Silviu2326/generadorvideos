import React from 'react';
import { TimelineContainer } from './components/Timeline/TimelineContainer';
import { VideoPlayer } from './components/Preview/VideoPlayer';
import { Project } from '../../../types';

interface ProjectEditorProps {
  project: Project | null;
  onBack: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onBack }) => {
  return (
    <div className="h-screen w-full bg-black text-white grid grid-rows-[60%_40%]">
      <div className="flex items-center justify-center border-b border-gray-800 relative">
        <button 
          onClick={onBack} 
          className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded z-10"
        >
          Back
        </button>
        <VideoPlayer className="w-full h-full object-contain max-h-full" />
      </div>
      <div className="overflow-hidden">
        <TimelineContainer />
      </div>
    </div>
  );
};

export default ProjectEditor;
