export interface Clip {
  id: string;
  trackId: string;
  name: string;
  start: number;
  duration: number;
  type: string;
}

export interface Track {
  id: string;
  name: string;
  clips: Clip[];
}

export interface Project {
  id: string;
  name: string;
  tracks: Track[];
}
