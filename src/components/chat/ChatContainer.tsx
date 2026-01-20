import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { RoomSelector } from "./RoomSelector";
import { ProfileEditor } from "./ProfileEditor";
import { AnimatePresence, motion } from "framer-motion";
import { useMessages } from "@/hooks/useMessages";
import { useChatRooms, ChatRoom } from "@/hooks/useChatRooms";
import { Profile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

interface ChatContainerProps {
  profile: Profile;
  onUpdateProfile: (updates: Partial<Profile>) => Promise<Profile | undefined>;
}

export const ChatContainer = ({ profile, onUpdateProfile }: ChatContainerProps) => {
  const { rooms, loading: roomsLoading, getDefaultRoom } = useChatRooms();
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading: messagesLoading, sendMessage } = useMessages(currentRoom?.id || null);

  useEffect(() => {
    if (!currentRoom && rooms.length > 0) {
      const defaultRoom = getDefaultRoom();
      setCurrentRoom(defaultRoom || rooms[0]);
    }
  }, [rooms, currentRoom, getDefaultRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, profile.id);
  };

  const handleSelectRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) setCurrentRoom(room);
  };

  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      <ChatHeader
        title={currentRoom?.name || "Chatt"}
        subtitle={currentRoom?.description || ""}
        username={profile.username}
        onProfileClick={() => setProfileEditorOpen(true)}
      />

      <RoomSelector
        rooms={rooms}
        currentRoomId={currentRoom?.id || null}
        onSelectRoom={handleSelectRoom}
      />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              <p>Inga meddelanden ännu.</p>
              <p className="text-sm">Bli den första att skriva något!</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === profile.id}
                />
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput onSendMessage={handleSendMessage} />

      <ProfileEditor
        profile={profile}
        isOpen={profileEditorOpen}
        onClose={() => setProfileEditorOpen(false)}
        onSave={onUpdateProfile}
      />
    </div>
  );
};
