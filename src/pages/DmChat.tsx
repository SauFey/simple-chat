import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import { MessageBubble } from "../components/ui/messagebubble";
import { useState } from "react";
import { ProfilePreviewModal } from "../components/profile/ProfilePreviewModal";
import { type PublicProfile } from "@/stores/uiStore";

const EMPTY_MESSAGES: any[] = [];

export function DmChat() {
  const { id } = useParams();
  const dmId = id ?? "alex";

  const ensureDm = useChatStore((s) => s.ensureDm);
  const meId = useChatStore((s) => s.meSaved.id);
  const messages = useChatStore((s) => s.dmMessages[dmId] ?? EMPTY_MESSAGES);

  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(
    null,
  );

  function openProfile(p: PublicProfile) {
    setSelectedProfile(p);
    setProfileOpen(true);
  }

  useEffect(() => {
    ensureDm(dmId);
  }, [dmId, ensureDm]);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    requestAnimationFrame(() => endRef.current?.scrollIntoView());
  }, [messages.length]);

  return (
    <div className="p-4">
      <div className="text-sm text-muted-foreground">PM med</div>
      <h1 className="text-lg font-semibold">{dmId}</h1>

      <div className="mt-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} isMe={m.senderId === meId} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
