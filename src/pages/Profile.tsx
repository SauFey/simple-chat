export function Profile() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">Profil</h1>

      <section className="rounded-lg border p-3 space-y-2">
        <div className="font-medium">Bio</div>
        <textarea
          className="w-full rounded-md border bg-background p-2 text-sm"
          placeholder="Skriv något om dig…"
          rows={3}
        />
      </section>

      <section className="rounded-lg border p-3 grid grid-cols-2 gap-2">
        <div>
          <div className="text-sm font-medium">Kön / identitet</div>
          <input
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
            placeholder="Valfritt"
          />
        </div>
        <div>
          <div className="text-sm font-medium">Ort</div>
          <input
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
            placeholder="t.ex. Malmö"
          />
        </div>
      </section>

      <section className="rounded-lg border p-3 space-y-2">
        <div className="font-medium">Profilbild</div>
        <input type="file" accept="image/*" className="text-sm" />
      </section>

      <section className="rounded-lg border p-3 flex items-center justify-between">
        <div>
          <div className="font-medium">NSFW</div>
          <div className="text-sm text-muted-foreground">
            Visa innehåll som kan vara 18+
          </div>
        </div>
        <input type="checkbox" className="h-5 w-5" />
      </section>

      <section className="rounded-lg border p-3">
        <div className="font-medium">Inställningar</div>
        <p className="text-sm text-muted-foreground mt-1">
          (kommer sen) block/mute, privacy, notiser, etc.
        </p>
      </section>
    </div>
  );
}
