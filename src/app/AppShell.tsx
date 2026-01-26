import { Outlet, Navigate, useLocation } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { ComposerBar } from "../components/ui/ComposerBar";
import { ProfilePreviewModal } from "../components/profile/ProfilePreviewModal";
import { useChatStore } from "@/stores/chatStore";
import { useUiStore } from "@/stores/uiStore";
import { useEffect } from "react";

export function isChatRoute(pathname: string) {
  return pathname.startsWith("/room/") || pathname.startsWith("/dm/");
}

export function AppShell() {
  const location = useLocation();
  const showComposer = isChatRoute(location.pathname);
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => clearToast(), 2200);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

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
      {toast && (
        <div className="fixed inset-x-0 top-2 z-[100] mx-auto w-full max-w-md px-3">
          <div className="rounded-xl border bg-background/95 px-3 py-2 text-sm shadow-md backdrop-blur">
            {toast.message}
          </div>
        </div>
      )}

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
