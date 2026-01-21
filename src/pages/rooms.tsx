import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useChatStore } from "../stores/chatStore";
import { ROOMS } from "../data/rooms";

export function Rooms() {
  const onlineCount = useChatStore((s) => s.onlineCount);
  const roomPresence = useChatStore((s) => s.roomPresence);
  const setOnlineCount = useChatStore((s) => s.setOnlineCount);
  const setRoomPresence = useChatStore((s) => s.setRoomPresence);

  // (valfritt) “live-känsla” utan backend
  useEffect(() => {
    const t = setInterval(() => {
      setOnlineCount(Math.max(1, onlineCount + (Math.random() > 0.5 ? 1 : -1)));

      ROOMS.forEach((r) => {
        const base = roomPresence[r.id] ?? 0;
        const delta = Math.random() > 0.6 ? 1 : Math.random() < 0.2 ? -1 : 0;
        setRoomPresence(r.id, Math.max(0, base + delta));
      });
    }, 2500);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-lg border p-3">
        <div className="text-sm text-muted-foreground">Online just nu</div>
        <div className="text-2xl font-semibold">{onlineCount}</div>
      </div>

      <div className="space-y-2">
        {ROOMS.map((r) => (
          <Link
            key={r.id}
            to={`/room/${r.id}`}
            className="block rounded-lg border p-3 hover:bg-muted transition"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-muted-foreground">
                {roomPresence[r.id] ?? 0} deltagare
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
