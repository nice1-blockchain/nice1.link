// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL! as string;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY! as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️ Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tipos generados de la tabla
export interface GameMetadataRow {
  id: string;
  product_name: string;
  owner_account: string;
  short_description: string;
  long_description: string;
  cover_image: string;
  video_url: string;
  previews: string[];
  tags: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}