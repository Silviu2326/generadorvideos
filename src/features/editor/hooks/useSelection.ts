import { useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';

export const useSelection = () => {
  const setSelectedClip = useEditorStore((state) => state.setSelectedClip);
  const selectedClipId = useEditorStore((state) => state.selectedClipId);

  const selectClip = useCallback((id: string) => {
    setSelectedClip(id);
  }, [setSelectedClip]);

  const deselectAll = useCallback(() => {
    setSelectedClip(null);
  }, [setSelectedClip]);

  return {
    selectedClipId,
    selectClip,
    deselectAll,
  };
};
