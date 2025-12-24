import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Project } from '../types';

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
  const project: Project = req.body;
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
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
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(204).send();
};
