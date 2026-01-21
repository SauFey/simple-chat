import { useLocation, useParams } from "react-router-dom";
import { useChatStore } from "@/stores/chatStore";
import { useState } from "react";

export function ComposerBar() {
  const { pathname } = useLocation();
  const { roomId } = useParams<{ roomId: string }>(); // ✅ rum
  const { id: dmId } = useParams<{ id: string }>(); // ✅ dm

  const sendRoomMessage = useChatStore((s) => s.sendRoomMessage);
  const sendDmMessage = useChatStore((s) => s.sendDmMessage);

  const [text, setText] = useState("");

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (pathname.startsWith("/room/")) {
      if (!roomId) return;
      sendRoomMessage(roomId, trimmed);
      setText("");
      return;
    }

    if (pathname.startsWith("/dm/")) {
      if (!dmId) return;
      sendDmMessage(dmId, trimmed);
      setText("");
      return;
    }
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 mx-auto w-full max-w-md border-t bg-background p-3">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-11 w-full rounded-md border bg-background px-3 text-sm"
          placeholder="Skriv ett meddelande…"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          className="h-11 rounded-md border px-4 text-sm hover:bg-muted transition"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}
