/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://avvaxbrkqjahuwjcvbkm.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_j44sYlC0zAxMOSfnXLTJtg_Vbdc8Xh1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Health check helper to test if Supabase is reachable and tables exist
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('students').select('student_id', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        return { connected: true, message: 'Connected to Supabase! (Table schema needs to be executed)' };
      }
      return { connected: false, message: error.message };
    }
    return { connected: true, message: `Connected to Supabase successfully!` };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Could not connect to Supabase' };
  }
}
