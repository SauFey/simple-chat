import { MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  username?: string;
  onProfileClick?: () => void;
}

export const ChatHeader = ({
  title = "Chatt",
  subtitle = "Online",
  username,
  onProfileClick,
}: ChatHeaderProps) => {
  return (
    <header className="flex items-center gap-3 px-6 py-4 bg-chat-header-bg border-b border-border shadow-card-soft">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
        <MessageCircle className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {username && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onProfileClick}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="hidden sm:inline text-sm font-medium">{username}</span>
        </Button>
      )}
    </header>
  );
};
