import type { ChatMessage } from "../../stores/chatStore";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({
  msg,
  isMe,
}: {
  msg: ChatMessage;
  isMe: boolean;
}) {
  return (
    <div className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <img
          src={msg.avatarUrl}
          alt={msg.senderName}
          className="h-9 w-9 rounded-full border object-cover"
        />
      )}

      <div
        className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col`}
      >
        <div
          className={`flex items-baseline gap-2 ${isMe ? "justify-end" : ""}`}
        >
          <span className="text-xs font-medium">{msg.senderName}</span>
          <span className="text-[11px] text-muted-foreground">
            {formatTime(msg.createdAt)}
          </span>
        </div>

        <div className="rounded-2xl border px-3 py-2 text-sm">{msg.text}</div>
      </div>

      {isMe && (
        <img
          src={msg.avatarUrl}
          alt={msg.senderName}
          className="h-9 w-9 rounded-full border object-cover"
        />
      )}
    </div>
  );
}
