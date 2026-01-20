import { supabase } from "./supabaseClient";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase är inte konfigurerat. Kontrollera .env (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY).",
    );
  }
  return supabase;
}

function extFromFile(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "png";
}

export async function uploadAvatar(userId: string, file: File) {
  const sb = requireSupabase();

  const ext = extFromFile(file);
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error } = await sb.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProfilePhoto(userId: string, file: File) {
  const sb = requireSupabase();

  const ext = extFromFile(file);
  const path = `${userId}/photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await sb.storage
    .from("profile-photos")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  const { data } = sb.storage.from("profile-photos").getPublicUrl(path);
  return data.publicUrl;
}
