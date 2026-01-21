import { useEffect } from "react";
import { UserLink } from "@/components/user/UserLink";
import type { PublicProfile } from "@/stores/uiStore";

export function ParticipantsDrawer({
  open,
  onClose,
  title,
  users,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  users: PublicProfile[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Stäng"
        onClick={onClose}
      />

      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-[85%] max-w-xs border-l bg-background shadow-xl">
        <div className="flex items-center justify-between border-b p-3">
          <div>
            <div className="text-sm text-muted-foreground">Deltagare</div>
            <div className="font-semibold">{title}</div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md border px-2 py-1 text-sm hover:bg-muted transition"
          >
            ✕
          </button>
        </div>

        <div className="p-3 space-y-2 overflow-y-auto h-[calc(100%-57px)]">
          {users.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Inga deltagare just nu.
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <UserLink profile={u} showAvatar showName />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
