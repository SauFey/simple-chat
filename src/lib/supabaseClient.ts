import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export let supabase: SupabaseClient | null = null;

if (url && anonKey) {
  supabase = createClient(url, anonKey);
} else {
  console.warn(
    "Supabase env saknas. Lägg till VITE_SUPABASE_URL och VITE_SUPABASE_ANON_KEY i din .env",
  );
}
