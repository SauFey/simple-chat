import { useChatStore } from "@/stores/chatStore";
import { Link } from "react-router-dom";

export function Explore() {
  const me = useChatStore((s) => s.meSaved);

  if (me.accountType === "guest") {
    return (
      <div className="p-4 space-y-3">
        <h1 className="text-xl font-semibold">Explore</h1>
        <div className="rounded-lg border p-3">
          <div className="font-medium">Explore är för medlemmar</div>
          <div className="text-sm text-muted-foreground">
            Claim ditt konto för att hitta vänner och starta nya kontakter.
          </div>
          <Link
            to="/claim"
            className="mt-3 inline-flex h-10 items-center rounded-md border px-3 text-sm hover:bg-muted transition"
          >
            Bli medlem / Claim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* din explore-lista */}
      Explore content...
    </div>
  );
}
