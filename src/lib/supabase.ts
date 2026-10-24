import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

/**
 * null when the build has no Supabase keys: the app then stays local-only.
 * The session lives in localStorage; supabase-js already pauses token refresh while the page is hidden.
 */
export const supabase = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }) : null;
