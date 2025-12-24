import { Request, Response } from 'express';
import { MediaAsset, Folder } from '../types';

// Mock Data
let assets: MediaAsset[] = [
  { id: '1', name: 'A001_C003_Shibuya.mp4', type: 'video', size: '1.2 GB', date: '2023-10-24', duration: '00:04:12', resolution: '3840x2160', fps: '24.00', codec: 'H.264', folderId: 'cam-a', thumbnail: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1000&auto=format&fit=crop' },
  { id: '2', name: 'A001_C005_Crossing.mp4', type: 'video', size: '850 MB', date: '2023-10-24', duration: '00:02:45', resolution: '3840x2160', fps: '60.00', codec: 'H.265', folderId: 'cam-a', thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop' },
  { id: '3', name: 'Drone_Shot_Tokyo_Night.mov', type: 'video', size: '2.4 GB', date: '2023-10-25', duration: '00:01:30', resolution: '3840x2160', fps: '24.00', codec: 'ProRes 422', folderId: 'cam-b', thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop' },
  { id: '4', name: 'VO_Intro_Take2.wav', type: 'audio', size: '45 MB', date: '2023-10-26', duration: '00:00:45', codec: 'WAV 48kHz', folderId: 'audio' },
  { id: '5', name: 'Logo_Transparent.png', type: 'image', size: '2.1 MB', date: '2023-10-20', resolution: '2000x2000', folderId: 'graphics', thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799314346d?q=80&w=1000&auto=format&fit=crop' },
  { id: '6', name: 'Background_Music_Lofi.mp3', type: 'audio', size: '12 MB', date: '2023-10-22', duration: '00:03:20', codec: 'MP3 320kbps', folderId: 'audio' },
  { id: '7', name: 'Reference_Script_v3.pdf', type: 'document', size: '1.5 MB', date: '2023-10-21', folderId: 'graphics' },
  { id: '8', name: 'B-Roll_Neon_Signs.mp4', type: 'video', size: '560 MB', date: '2023-10-25', duration: '00:00:15', resolution: '1920x1080', fps: '120.00', codec: 'H.264', folderId: 'cam-a', thumbnail: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1000&auto=format&fit=crop' },
];

let folders: Folder[] = [
  { id: 'all', name: 'Todos los Medios' },
  { id: 'cam-a', name: 'Cámara A (Sony)' },
  { id: 'cam-b', name: 'Cámara B (Drone)' },
  { id: 'audio', name: 'Grabaciones Audio' },
  { id: 'graphics', name: 'Gráficos & VFX' },
  { id: 'exports', name: 'Exportaciones' },
];

export const getAllAssets = (req: Request, res: Response) => {
  res.json(assets);
};

export const createAsset = (req: Request, res: Response) => {
  const newAsset: MediaAsset = {
    id: Date.now().toString(), // Simple ID generation
    ...req.body,
    date: new Date().toISOString().split('T')[0]
  };
  assets.push(newAsset);
  res.status(201).json(newAsset);
};

export const deleteAsset = (req: Request, res: Response) => {
  const { id } = req.params;
  assets = assets.filter(a => a.id !== id);
  res.status(200).json({ message: 'Asset deleted successfully' });
};

export const getFolders = (req: Request, res: Response) => {
  res.json(folders);
};
