import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { MessageBubble } from "../components/ui/messagebubble";
import { useChatStore } from "../stores/chatStore";
import { useState } from "react";
import { PublicProfile } from "@/stores/uiStore";
import { ROOMS } from "../data/rooms";

const EMPTY_MESSAGES: any[] = [];

export function RoomChat() {
  const { id } = useParams();
  const roomId = id ?? "allmant";

  const ensureRoom = useChatStore((s) => s.ensureRoom);
  const meId = useChatStore((s) => s.meSaved.id);
  const messages = useChatStore(
    (s) => s.roomMessages[roomId] ?? EMPTY_MESSAGES,
  );

  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(
    null,
  );

  function openProfile(p: PublicProfile) {
    setSelectedProfile(p);
    setProfileOpen(true);
  }

  // Initiera rummet EN gång per roomId
  useEffect(() => {
    ensureRoom(roomId);
  }, [roomId, ensureRoom]);

  // Auto-scroll (utan att orsaka re-render loops)
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    requestAnimationFrame(() => endRef.current?.scrollIntoView());
  }, [messages.length]);

  return (
    <div className="p-4">
      <div className="text-sm text-muted-foreground">Rum</div>
      <h1 className="text-lg font-semibold">#{roomId}</h1>

      <div className="mt-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} isMe={m.senderId === meId} />
        ))}

        <div ref={endRef} />
      </div>
    </div>
  );
}
