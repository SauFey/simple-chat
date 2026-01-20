import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
}

export const useChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('name');

    if (!error && data) {
      setRooms(data);
    }
    setLoading(false);
  };

  const getDefaultRoom = () => {
    return rooms.find(room => room.name === 'Global');
  };

  return { rooms, loading, getDefaultRoom };
};
