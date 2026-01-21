import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { ComposerBar } from "../components/ui/ComposerBar";
import { ProfilePreviewModal } from "../components/profile/ProfilePreviewModal";

function isChatRoute(pathname: string) {
  return /^\/(dm|rooms)\/[^/]+$/.test(pathname);
}

export function AppShell() {
  const location = useLocation();
  const showComposer = isChatRoute(location.pathname);

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
