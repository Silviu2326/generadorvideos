import { useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';

export const useEditorShortcuts = () => {
  const togglePlay = useEditorStore((state) => state.togglePlay);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault(); // Prevent scrolling
          togglePlay();
          break;
        case 'Delete':
          console.log('Borrar clip');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);
};
