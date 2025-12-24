import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Reminder } from '../types';

export const getAllReminders = async (req: Request, res: Response) => {
  console.log('GET /api/reminders hit');
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching reminders from Supabase:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

export const createReminder = async (req: Request, res: Response) => {
  const reminder: Reminder = req.body;
  const { data, error } = await supabase
    .from('reminders')
    .insert([reminder])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
};

export const updateReminder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Partial<Reminder> = req.body;
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

export const deleteReminder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(204).send();
};
