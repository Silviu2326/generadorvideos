import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';

export const usePlayback = () => {
  const isPlaying = useEditorStore((state) => state.playback.isPlaying);
  const setPlayback = useEditorStore((state) => state.setPlayback);
  const togglePlayStore = useEditorStore((state) => state.togglePlay);

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000; // Seconds
      const current = useEditorStore.getState().playback.currentTime;
      
      setPlayback({ currentTime: current + deltaTime });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [setPlayback]);

  useEffect(() => {
    if (isPlaying) {
      // Initialize lastTimeRef with the current time when starting
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      lastTimeRef.current = undefined;
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, animate]);

  const play = useCallback(() => setPlayback({ isPlaying: true }), [setPlayback]);
  const pause = useCallback(() => setPlayback({ isPlaying: false }), [setPlayback]);
  
  return { 
    play, 
    pause, 
    toggle: togglePlayStore 
  };
};
