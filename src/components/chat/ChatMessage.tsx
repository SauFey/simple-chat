import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "other";
  timestamp: Date;
  senderName?: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex w-full mb-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] px-4 py-2.5 rounded-2xl shadow-bubble",
          isUser
            ? "bg-chat-bubble-sent text-chat-bubble-sent-foreground rounded-br-md"
            : "bg-chat-bubble-received text-chat-bubble-received-foreground rounded-bl-md"
        )}
      >
        {!isUser && message.senderName && (
          <p className="text-xs font-medium text-primary mb-1">
            {message.senderName}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isUser ? "text-chat-bubble-sent-foreground/70" : "text-chat-timestamp"
          )}
        >
          {message.timestamp.toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
};
