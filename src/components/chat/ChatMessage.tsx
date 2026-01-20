import { motion } from "framer-motion";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage as MessageType } from "@/hooks/useMessages";

interface ChatMessageProps {
  message: MessageType;
  isOwn: boolean;
}

export const ChatMessage = ({ message, isOwn }: ChatMessageProps) => {
  const timestamp = new Date(message.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex w-full mb-3",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div className="flex items-end gap-2 max-w-[75%]">
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            {message.sender?.avatar_url ? (
              <img
                src={message.sender.avatar_url}
                alt={message.sender.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        )}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl shadow-bubble",
            isOwn
              ? "bg-chat-bubble-sent text-chat-bubble-sent-foreground rounded-br-md"
              : "bg-chat-bubble-received text-chat-bubble-received-foreground rounded-bl-md"
          )}
        >
          {!isOwn && message.sender && (
            <p className="text-xs font-medium text-primary mb-1">
              {message.sender.username}
            </p>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p
            className={cn(
              "text-[10px] mt-1",
              isOwn ? "text-chat-bubble-sent-foreground/70" : "text-chat-timestamp"
            )}
          >
            {timestamp.toLocaleTimeString("sv-SE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
