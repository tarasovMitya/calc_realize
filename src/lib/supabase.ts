import { createClient } from "@supabase/supabase-js";

const w = window as unknown as { __env__?: { VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string } };
const supabaseUrl = w.__env__?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = w.__env__?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
