import { MessageCircle } from "lucide-react";

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
}

export const ChatHeader = ({ 
  title = "Chatt", 
  subtitle = "Online" 
}: ChatHeaderProps) => {
  return (
    <header className="flex items-center gap-3 px-6 py-4 bg-chat-header-bg border-b border-border shadow-card-soft">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
        <MessageCircle className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {subtitle}
        </p>
      </div>
    </header>
  );
};
