import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageBubble } from "../components/ui/messagebubble";
import { useChatStore } from "../stores/chatStore";
import { ROOMS } from "../data/rooms";
import { ParticipantsDrawer } from "@/components/room/ParticipantsDrawer";

const EMPTY_MESSAGES: any[] = [];

export function RoomChat() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;

  if (!roomId) return null;

  const roomKey = roomId;

  const ensureRoom = useChatStore((s) => s.ensureRoom);
  const meId = useChatStore((s) => s.meSaved.id);

  const participants = useChatStore((s) => s.roomParticipants[roomKey] ?? []);
  const messages = useChatStore(
    (s) => s.roomMessages[roomKey] ?? EMPTY_MESSAGES,
  );

  const roomName = useMemo(() => {
    return ROOMS.find((r) => r.id === roomKey)?.name ?? roomKey;
  }, [roomKey]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Initiera rummet när roomId ändras
  useEffect(() => {
    ensureRoom(roomKey);
  }, [roomKey, ensureRoom]);

  // Auto-scroll när nya meddelanden kommer
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    requestAnimationFrame(() => endRef.current?.scrollIntoView());
  }, [messages.length]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Rum</div>
          <h1 className="text-lg font-semibold">{roomName}</h1>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted transition"
        >
          Deltagare
        </button>
      </div>

      {/* Messages */}
      <div className="mt-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} isMe={m.senderId === meId} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Drawer */}
      <ParticipantsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={roomName}
        users={participants}
      />
    </div>
  );
}
