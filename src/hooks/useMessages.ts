import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  content: string;
  room_id: string;
  sender_id: string;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export const useMessages = (roomId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:temp_profiles!sender_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data as ChatMessage[]);
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => {
          // Fetch the sender info for the new message
          const newMessage = payload.new as { id: string; sender_id: string };
          const { data: senderData } = await supabase
            .from('temp_profiles')
            .select('id, username, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const messageWithSender = {
            ...newMessage,
            sender: senderData,
          } as ChatMessage;

          setMessages((prev) => [...prev, messageWithSender]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchMessages]);

  const sendMessage = async (content: string, senderId: string) => {
    if (!roomId || !content.trim()) return;

    const { error } = await supabase.from('messages').insert({
      content: content.trim(),
      room_id: roomId,
      sender_id: senderId,
    });

    if (error) throw error;
  };

  return { messages, loading, sendMessage };
};
