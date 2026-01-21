import type { ChatMessage } from "../../stores/chatStore";
import { UserLink } from "../user/UserLink";

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
  const profile = {
    id: msg.senderId,
    name: msg.senderName,
    avatarUrl: msg.avatarUrl,
    // TODO: koppla riktiga fält senare
    location: undefined,
    age: undefined,
    isMe,
  };

  return (
    <div className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {/* Avatar vänster */}
      {!isMe && (
        <UserLink
          profile={profile}
          showAvatar
          showName={false}
          className="shrink-0"
        />
      )}

      <div
        className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col`}
      >
        {/* Namn + tid (klickbart namn) */}
        <div
          className={`flex items-baseline gap-2 ${isMe ? "justify-end" : ""}`}
        >
          <UserLink profile={profile} showAvatar={false} showName />
          <span className="text-xs text-muted-foreground">
            {formatTime(msg.createdAt)}
          </span>
        </div>

        <div className="rounded-2xl border px-3 py-2 text-sm">{msg.text}</div>
      </div>

      {/* Avatar höger */}
      {isMe && (
        <UserLink
          profile={profile}
          showAvatar
          showName={false}
          className="shrink-0"
        />
      )}
    </div>
  );
}
