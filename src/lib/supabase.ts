// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export { supabaseClient as supabase };

// Types for your database tables
export type Portfolio = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  icon: string;
  created_at: string;
};

// Example Mutation
