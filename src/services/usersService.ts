import { supabase } from '../supabaseClient';
import type { AppUser } from '../types';

export async function loadUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from('gymbro_users')
    .select('id, name')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
