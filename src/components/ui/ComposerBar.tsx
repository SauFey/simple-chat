import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useChatStore } from "../../stores/chatStore";

function parseChatTarget(pathname: string): { kind: "room" | "dm" | "none" } {
  if (/^\/rooms\/[^/]+$/.test(pathname)) return { kind: "room" };
  if (/^\/dm\/[^/]+$/.test(pathname)) return { kind: "dm" };
  return { kind: "none" };
}

export function ComposerBar() {
  const [text, setText] = useState("");

  const location = useLocation();
  const params = useParams();

  const target = useMemo(
    () => parseChatTarget(location.pathname),
    [location.pathname],
  );

  const sendRoomMessage = useChatStore((s) => s.sendRoomMessage);
  const sendDmMessage = useChatStore((s) => s.sendDmMessage);

  const id = params.id; // route param från /rooms/:id eller /dm/:id

  function send() {
    const msg = text.trim();
    if (!msg) return;

    if (!id || target.kind === "none") return;

    if (target.kind === "room") sendRoomMessage(id, msg);
    if (target.kind === "dm") sendDmMessage(id, msg);

    setText("");
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-md items-center gap-2 px-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Skriv ett meddelande…"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none"
        />
        <button
          onClick={send}
          className="h-10 shrink-0 rounded-md border px-3 text-sm"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}
