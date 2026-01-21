import { useChatStore } from "@/stores/chatStore";

export function Claim() {
  const me = useChatStore((s) => s.meSaved);

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Ditt gästkonto har upphört</h1>
      <p className="text-sm text-muted-foreground">
        Claim ditt konto för att behålla profil och fortsätta chatta.
      </p>

      <div className="rounded-lg border p-3">
        <div className="font-medium">{me.name}</div>
        <div className="text-sm text-muted-foreground">
          Gästkonto: {me.guestExpiresAt}
        </div>
      </div>

      <button className="h-11 w-full rounded-md border text-sm hover:bg-muted transition">
        Claim konto (kommer snart)
      </button>
    </div>
  );
}
