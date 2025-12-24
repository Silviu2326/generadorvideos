export interface Project {
  id?: string;
  name: string;
  thumbnail?: string;
  status: 'In Script' | 'Editing' | 'Rendering' | 'Post-Prod' | 'Review' | 'Draft' | 'Finished';
  lastEdited: string;
  progress?: number;
  type?: string;
  duration?: string;
  data?: any;
}

export interface Reminder {
  id?: string;
  text: string;
  priority: 'High' | 'Normal' | 'Low';
  date?: string;
  completed: boolean;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document';
  size: string;
  date: string;
  duration?: string;
  resolution?: string;
  fps?: string;
  codec?: string;
  thumbnail?: string;
  folderId: string;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
}

export interface PlatformStats {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon?: string;
  color?: string;
}

export interface ChartDataPoint {
  day: string;
  views: number;
  subs: number;
  ctr: number;
}

export interface Post {
  id: number;
  title: string;
  platform: string;
  date: string;
  views: string;
  likes: string;
  thumb: string;
}

export interface Demographic {
  label: string;
  percent: number;
  color: string;
}

export interface Country {
  country: string;
  flag: string;
  percent: number;
}
