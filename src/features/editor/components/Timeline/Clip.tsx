import React, { memo } from 'react';
import { Clip as ClipType } from '@/src/types/editor';

interface ClipProps {
  clip: ClipType;
  zoomLevel: number;
}

const Clip: React.FC<ClipProps> = ({ clip, zoomLevel }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: clip.start * zoomLevel,
      }}
    >
      {clip.name}
    </div>
  );
};

export default memo(Clip);
