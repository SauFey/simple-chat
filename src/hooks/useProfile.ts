import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateRandomName, generateSessionId } from '@/lib/randomNames';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  age: number | null;
  gender: 'man' | 'kvinna' | 'annat' | 'föredrar_att_inte_säga' | null;
  location: string | null;
  session_id: string;
}

const SESSION_KEY = 'chat_session_id';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    const sessionId = localStorage.getItem(SESSION_KEY);
    
    if (sessionId) {
      const { data, error } = await supabase
        .from('temp_profiles')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (data && !error) {
        setProfile(data as Profile);
        setNeedsSetup(false);
        setLoading(false);
        
        // Update last_seen
        await supabase
          .from('temp_profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', data.id);
        
        return;
      }
    }

    setNeedsSetup(true);
    setLoading(false);
  };

  const createProfile = async (username: string) => {
    const sessionId = generateSessionId();
    const finalUsername = username.trim() || generateRandomName();

    const { data, error } = await supabase
      .from('temp_profiles')
      .insert({
        username: finalUsername,
        session_id: sessionId,
      })
      .select()
      .single();

    if (error) {
      // If username exists, try with random suffix
      if (error.code === '23505') {
        const newUsername = `${finalUsername}${Math.floor(Math.random() * 1000)}`;
        return createProfile(newUsername);
      }
      throw error;
    }

    localStorage.setItem(SESSION_KEY, sessionId);
    setProfile(data as Profile);
    setNeedsSetup(false);
    return data as Profile;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('temp_profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data as Profile);
    return data as Profile;
  };

  return {
    profile,
    loading,
    needsSetup,
    createProfile,
    updateProfile,
  };
};
