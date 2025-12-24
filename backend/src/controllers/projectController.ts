import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Project } from '../types';
import { createProjectSchema } from '../schemas/projectSchemas';
import { StorageService } from '../services/storageService';

export const getAllProjects = async (req: Request, res: Response) => {
  console.log('GET /api/projects hit');
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('lastEdited', { ascending: false });

  if (error) {
    console.error('Error fetching projects from Supabase:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

export const createProject = async (req: Request, res: Response) => {
  try {
    createProjectSchema.parse(req.body);
    const project: Project = req.body;
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Partial<Project> = req.body;
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. Fetch project to identify assets
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // 2. Iterate over assets and delete them (simulated)
  const assetsToDelete: string[] = [];
  if (project.thumbnail) {
    assetsToDelete.push(project.thumbnail);
  }
  // Adding simulated assets for demonstration
  assetsToDelete.push(`projects/${id}/assets/video_preview.mp4`);
  assetsToDelete.push(`projects/${id}/assets/audio_track.mp3`);

  for (const assetKey of assetsToDelete) {
    await StorageService.deleteFile(assetKey);
  }

  // 3. Delete from DB
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(204).send();
};
