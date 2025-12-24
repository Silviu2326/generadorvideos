import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useEditorStore } from '../../store/editorStore';
import { TrackHeader } from './TrackHeader';
import Clip from './Clip';
import { Track } from '../../../../types/editor';

// Hardcoded data as requested since store doesn't have tracks yet
const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    name: 'Video Track 1',
    clips: [
      { id: 'c1', trackId: '1', name: 'Intro', start: 0, duration: 100, type: 'video' },
      { id: 'c2', trackId: '1', name: 'Scene 1', start: 120, duration: 200, type: 'video' },
    ]
  },
  {
    id: '2',
    name: 'Audio Track 1',
    clips: [
      { id: 'c3', trackId: '2', name: 'BGM', start: 0, duration: 400, type: 'audio' },
    ]
  }
];

export const TimelineContainer: React.FC = () => {
  const zoomLevel = useEditorStore((state) => state.ui.zoomLevel);

  const handleDragStart = (event: DragStartEvent) => {
    // Empty for now
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Empty for now
  };

  return (
    <div className="flex flex-col w-full bg-gray-900 text-white overflow-y-auto h-full">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {MOCK_TRACKS.map((track) => (
          <div key={track.id} className="flex border-b border-gray-800 min-h-[56px]">
            <div className="flex-shrink-0">
              <TrackHeader track={track} />
            </div>
            <div className="flex-grow relative bg-gray-800/30 overflow-hidden">
              {track.clips.map((clip) => (
                <Clip key={clip.id} clip={clip} zoomLevel={zoomLevel} />
              ))}
            </div>
          </div>
        ))}
      </DndContext>
    </div>
  );
};