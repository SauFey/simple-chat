import { useState } from "react";

export function ComposerBar() {
  const [text, setText] = useState("");

  function send() {
    const msg = text.trim();
    if (!msg) return;
    console.log("SEND:", msg);
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
