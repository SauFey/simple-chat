import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { AnimatePresence } from "framer-motion";

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hej! Välkommen till chatten 👋",
    sender: "other",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    senderName: "Support",
  },
  {
    id: "2",
    content: "Hur kan jag hjälpa dig idag?",
    sender: "other",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    senderName: "Support",
  },
];

const botResponses = [
  "Tack för ditt meddelande! 😊",
  "Det låter intressant, berätta mer!",
  "Jag förstår vad du menar.",
  "Bra fråga! Låt mig fundera på det.",
  "Absolut, jag kan hjälpa dig med det.",
  "Vad kul att höra! 🎉",
];

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: "other",
        timestamp: new Date(),
        senderName: "Support",
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      <ChatHeader title="Support" subtitle="Online" />
      
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};
