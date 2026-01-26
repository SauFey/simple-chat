import { useChatStore } from "@/stores/chatStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/uiStore";

function formatGuestCreatedAt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);

  const date = d.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const time = d.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} • ${time}`;
}

export function Claim() {
  const navigate = useNavigate();
  const resetGuestAccount = useChatStore((s) => s.resetGuestAccount);
  const meSaved = useChatStore((s) => s.meSaved);
  const showToast = useUiStore((s) => s.showToast);

  function doReset(preferSame: boolean) {
    const res = resetGuestAccount({
      preferName: preferSame ? meSaved.name : undefined,
    });

    showToast(
      res.kept
        ? `Du behöll namnet ${res.name}`
        : `Ditt nya namn är ${res.name}`,
    );
    navigate("/rooms", { replace: true });
  }

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Ditt gästkonto har upphört</h1>
      <p className="text-sm text-muted-foreground">
        Claim ditt konto för att behålla profil och fortsätta chatta.
      </p>

      <button
        className="h-20 w-full rounded-md border text-sm font-medium hover:bg-muted transition"
        onClick={() => doReset(true)}
      >
        <div className="font-medium">{meSaved.name}</div>
        <div className="text-sm text-muted-foreground">
          Konto avslutas: {formatGuestCreatedAt(meSaved.guestExpiresAt)}
        </div>
        <div className="font-medium mt-2">Behåll detta konto (om möjligt)</div>
      </button>

      <button
        className="mt-2 h-11 w-full rounded-md border text-sm font-medium hover:bg-muted transition"
        onClick={() => doReset(false)}
      >
        Skapa nytt gästkonto
      </button>
    </div>
  );
}
