import { Outlet, Navigate, useLocation } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { ComposerBar } from "../components/ui/ComposerBar";
import { ProfilePreviewModal } from "../components/profile/ProfilePreviewModal";
import { useChatStore } from "@/stores/chatStore";

export function isChatRoute(pathname: string) {
  return pathname.startsWith("/room/") || pathname.startsWith("/dm/");
}

export function AppShell() {
  const location = useLocation();
  const showComposer = isChatRoute(location.pathname);

  const me = useChatStore((s) => s.meSaved);
  if (
    me.accountType === "guest" &&
    me.guestExpiresAt &&
    Date.now() > new Date(me.guestExpiresAt).getTime()
  ) {
    if (location.pathname !== "/claim") return <Navigate to="/claim" replace />;
  }

  const bottomPadding = showComposer ? "pb-32" : "pb-16";

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className={`mx-auto w-full max-w-md ${bottomPadding}`}>
        <Outlet />
      </main>

      {showComposer && <ComposerBar />}

      <BottomNav />

      {/* ✅ Global profil-preview */}
      <ProfilePreviewModal />
    </div>
  );
}
