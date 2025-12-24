import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';

interface VideoPlayerProps {
  src?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentTime = useEditorStore((state) => state.playback.currentTime);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Sync store time to video time
    // We use a small threshold (0.01s) to ensure the video jumps to the correct frame immediately when seeking,
    // while avoiding unnecessary updates due to tiny floating point differences.
    if (Math.abs(video.currentTime - currentTime) > 0.01) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      controls // Adding controls for basic usability unless strictly managed externally
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
};
