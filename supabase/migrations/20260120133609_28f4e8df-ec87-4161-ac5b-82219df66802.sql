-- Create enum for gender
CREATE TYPE public.gender_type AS ENUM ('man', 'kvinna', 'annat', 'föredrar_att_inte_säga');

-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default rooms
INSERT INTO public.chat_rooms (name, description) VALUES
  ('Global', 'Öppen chatt för alla'),
  ('Tjejsnack', 'Chatt för tjejer'),
  ('Killsnack', 'Chatt för killar');

-- Create temporary profiles table (no auth required)
CREATE TABLE public.temp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  gender gender_type,
  location TEXT,
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.temp_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster message queries
CREATE INDEX idx_messages_room_created ON public.messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_temp_profiles_session ON public.temp_profiles(session_id);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms (public read)
CREATE POLICY "Anyone can view chat rooms"
ON public.chat_rooms FOR SELECT
USING (true);

-- RLS Policies for temp_profiles (public read, owner update)
CREATE POLICY "Anyone can view profiles"
ON public.temp_profiles FOR SELECT
USING (true);

CREATE POLICY "Anyone can create a profile"
ON public.temp_profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
ON public.temp_profiles FOR UPDATE
USING (true);

-- RLS Policies for messages (public read/write for chat)
CREATE POLICY "Anyone can view messages"
ON public.messages FOR SELECT
USING (true);

CREATE POLICY "Anyone can send messages"
ON public.messages FOR INSERT
WITH CHECK (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.temp_profiles;