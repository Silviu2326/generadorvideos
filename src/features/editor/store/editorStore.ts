import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  id: string;
  name: string;
}

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
}

interface UIState {
  zoomLevel: number;
}

interface EditorState {
  project: Project | null;
  selectedClipId: string | null;
  playback: PlaybackState;
  ui: UIState;
  
  // Actions
  setProject: (project: Project) => void;
  setSelectedClipId: (id: string | null) => void;
  setSelectedClip: (id: string | null) => void;
  setPlayback: (playback: Partial<PlaybackState>) => void;
  togglePlay: () => void;
  setZoomLevel: (zoomLevel: number) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      project: null,
      selectedClipId: null,
      playback: {
        isPlaying: false,
        currentTime: 0,
      },
      ui: {
        zoomLevel: 1,
      },

      setProject: (project) => set({ project }),
      setSelectedClipId: (id) => set({ selectedClipId: id }),
      setSelectedClip: (id) => set({ selectedClipId: id }),
      
      setPlayback: (playback) => set((state) => ({
        playback: { ...state.playback, ...playback }
      })),
      
      togglePlay: () => set((state) => ({
        playback: { ...state.playback, isPlaying: !state.playback.isPlaying }
      })),
      
      setZoomLevel: (zoomLevel) => set((state) => ({
        ui: { ...state.ui, zoomLevel }
      })),
    }),
    {
      name: 'editor-storage',
    }
  )
);