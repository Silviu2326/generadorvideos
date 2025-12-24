import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Warn but don't crash immediately to allow setup
  console.warn('Missing Supabase URL or Key in .env file');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');