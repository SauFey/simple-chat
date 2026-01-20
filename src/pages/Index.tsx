import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { profile, loading, needsSetup, createProfile, updateProfile } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (needsSetup || !profile) {
    return <WelcomeScreen onJoin={createProfile} />;
  }

  return <ChatContainer profile={profile} onUpdateProfile={updateProfile} />;
};

export default Index;
