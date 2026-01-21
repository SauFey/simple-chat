import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../stores/chatStore";
import { useUiStore } from "../../stores/uiStore";

type EffectiveProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
  age?: number;
  photos: { url: string; path?: string }[];
};

export function ProfilePreviewModal() {
  const navigate = useNavigate();

  const ensureDm = useChatStore((s) => s.ensureDm);
  const meSaved = useChatStore((s) => s.meSaved);

  const open = useUiStore((s) => s.profileOpen);
  const expanded = useUiStore((s) => s.profileExpanded);
  const profile = useUiStore((s) => s.selectedProfile);

  const close = useUiStore((s) => s.closeProfile);
  const expand = useUiStore((s) => s.expandProfile);
  const collapse = useUiStore((s) => s.collapseProfile);

  // ✅ Hooks som alltid ska köras: media viewer
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const effective: EffectiveProfile | null = useMemo(() => {
    if (!profile) return null;

    if (profile.isMe) {
      return {
        id: meSaved.id,
        name: meSaved.name,
        avatarUrl: meSaved.avatar?.url,
        location: meSaved.location,
        age: (meSaved as any)?.age,
        photos: (meSaved.photos ?? []).map((p: any) => ({
          url: p.url,
          path: p.path,
        })),
      };
    }

    return {
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      age: profile.age,
      photos: [],
    };
  }, [profile, meSaved]);

  const avatarSrc = useMemo(() => {
    return (
      effective?.avatarUrl ||
      "https://api.dicebear.com/9.x/thumbs/svg?seed=User"
    );
  }, [effective?.avatarUrl]);

  const mediaItems = useMemo(() => {
    const photos = effective?.photos ?? [];
    return [{ url: avatarSrc }, ...photos.map((p) => ({ url: p.url }))];
  }, [effective?.photos, avatarSrc]);

  // ✅ Sista: return guards (efter alla hooks)
  if (!open || !effective) return null;

  function startPm() {
    ensureDm(effective.id, { initiatedByMe: true });
    close();
    navigate(`/dm/${effective.id}`);
  }

  function toggleExpanded() {
    if (expanded) collapse();
    else expand();
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Stäng"
        onClick={close}
      />

      <div
        className={[
          "absolute inset-x-0 bottom-0 mx-auto w-full max-w-md overflow-hidden border bg-background shadow-xl transition-all duration-300",
          expanded ? "h-[92dvh] rounded-t-2xl" : "h-[55dvh] rounded-t-2xl",
        ].join(" ")}
      >
        <div
          className={[
            "relative bg-gradient-to-r from-fuchsia-500/30 via-indigo-500/30 to-sky-500/30",
            expanded ? "h-28" : "h-16",
          ].join(" ")}
        >
          <button
            onClick={close}
            className="absolute right-3 top-3 rounded-md border bg-background/80 px-2 py-1 text-sm hover:bg-muted transition"
          >
            ✕
          </button>
        </div>

        <button
          type="button"
          onClick={toggleExpanded}
          className="flex w-full justify-center py-2"
          aria-label={expanded ? "Minimera" : "Expandera"}
          title={expanded ? "Minimera" : "Expandera"}
        >
          <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        </button>

        <div className={expanded ? "h-full overflow-y-auto" : "h-full"}>
          <div className={(expanded ? "-mt-12" : "-mt-8") + " p-4 pb-6"}>
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setMediaIndex(0);
                  setMediaOpen(true);
                }}
                className="shrink-0"
                aria-label="Öppna bilder"
                title="Öppna bilder"
              >
                <img
                  src={avatarSrc}
                  alt={effective.name}
                  className={[
                    "rounded-full border bg-background object-cover transition-all duration-300",
                    expanded ? "h-28 w-28" : "h-20 w-20",
                  ].join(" ")}
                />
              </button>

              <div className="flex-1">
                <div className="text-xl font-semibold leading-tight">
                  {effective.name}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {effective.location ? (
                    <span className="rounded-full border px-2 py-0.5">
                      {effective.location}
                    </span>
                  ) : null}
                  {typeof effective.age === "number" ? (
                    <span className="rounded-full border px-2 py-0.5">
                      {effective.age} år
                    </span>
                  ) : null}

                  {profile?.isMe && meSaved.allowIncomingDms === false && (
                    <span className="rounded-full border px-2 py-0.5 text-sm">
                      PM avstängt
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border p-3">
              <div className="text-sm font-medium">Överblick</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {expanded
                  ? "Här kan vi visa bio, pronomen, intressen, badges osv."
                  : "Snabb överblick. Tryck “Visa profil” för mer."}
              </div>
            </div>

            {expanded && (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Info</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Ort: {effective.location ?? "—"}
                    <br />
                    Ålder:{" "}
                    {typeof effective.age === "number"
                      ? `${effective.age} år`
                      : "—"}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Bilder</div>

                  {(effective.photos ?? []).length === 0 ? (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Inga bilder ännu.
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {(effective.photos ?? []).map((p, i) => (
                        <button
                          key={p.url + i}
                          type="button"
                          onClick={() => {
                            setMediaIndex(i + 1); // +1 pga avatar index 0
                            setMediaOpen(true);
                          }}
                          className="block"
                          aria-label={`Öppna bild ${i + 1}`}
                        >
                          <img
                            src={p.url}
                            alt={`Bild ${i + 1}`}
                            className="aspect-square w-full rounded-md border object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={toggleExpanded}
                className="h-11 w-full rounded-md border text-sm font-medium hover:bg-muted transition active:scale-[0.99]"
              >
                {expanded ? "Minimera" : "Visa profil"}
              </button>

              <button
                onClick={startPm}
                className="h-11 w-full rounded-md border text-sm font-medium hover:bg-muted transition active:scale-[0.99]"
              >
                Starta PM
              </button>
            </div>
          </div>
        </div>
      </div>

      {mediaOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            className="absolute inset-0 bg-black/80"
            aria-label="Stäng bilder"
            onClick={() => setMediaOpen(false)}
          />
          <div className="absolute inset-x-0 top-10 mx-auto w-full max-w-md px-4">
            <div className="relative overflow-hidden rounded-2xl border bg-background shadow-xl">
              <div className="flex items-center justify-between border-b p-3">
                <div className="text-sm font-medium">
                  Bild {mediaIndex + 1} / {mediaItems.length}
                </div>
                <button
                  className="rounded-md border px-2 py-1 text-sm hover:bg-muted transition"
                  onClick={() => setMediaOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="p-3">
                <img
                  src={mediaItems[mediaIndex]?.url}
                  alt="Bild"
                  className="w-full rounded-xl border object-contain"
                  style={{ maxHeight: "70dvh" }}
                />

                <div className="mt-3 flex gap-2">
                  <button
                    className="h-10 w-full rounded-md border text-sm hover:bg-muted transition disabled:opacity-50"
                    onClick={() => setMediaIndex((i) => Math.max(0, i - 1))}
                    disabled={mediaIndex === 0}
                  >
                    Föregående
                  </button>
                  <button
                    className="h-10 w-full rounded-md border text-sm hover:bg-muted transition disabled:opacity-50"
                    onClick={() =>
                      setMediaIndex((i) =>
                        Math.min(mediaItems.length - 1, i + 1),
                      )
                    }
                    disabled={mediaIndex === mediaItems.length - 1}
                  >
                    Nästa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
