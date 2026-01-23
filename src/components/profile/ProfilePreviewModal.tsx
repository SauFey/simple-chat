import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../stores/chatStore";
import { useUiStore } from "../../stores/uiStore";
import {
  REL_STATUS_OPTIONS,
  GENDER_OPTIONS,
  PRONOUN_OPTIONS,
} from "../../stores/chatStore";

type EffectiveProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
  age?: number;
  bio?: string;
  pronouns?: string;
  orientations?: string[];
  orientationOtherText?: string;
  genderIdentity?: string;
  relationshipStatus?: string;
  photos: { url: string; path?: string }[];
};

export function ProfilePreviewModal() {
  const navigate = useNavigate();

  const meSaved = useChatStore((s) => s.meSaved);
  const sendDmRequest = useChatStore((s) => s.sendDmRequest);

  const open = useUiStore((s) => s.profileOpen);
  const expanded = useUiStore((s) => s.profileExpanded);
  const profile = useUiStore((s) => s.selectedProfile);
  const close = useUiStore((s) => s.closeProfile);
  const expand = useUiStore((s) => s.expandProfile);
  const collapse = useUiStore((s) => s.collapseProfile);

  // ✅ Hooks som alltid ska köras: media viewer
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [sent, setSent] = useState(false);

  const effective: EffectiveProfile | null = useMemo(() => {
    if (!profile) return null;
    if (profile?.isMe) {
      return {
        id: meSaved.id,
        name: meSaved.name,
        avatarUrl: meSaved.avatar?.url,
        location: meSaved.location,
        age: (meSaved as any)?.age,
        bio: meSaved.bio ?? "",
        relationshipStatus: (meSaved as any).relationshipStatus ?? "",
        genderIdentity: meSaved.genderIdentity ?? "",
        pronouns: meSaved.pronouns ?? "",
        orientations: (meSaved as any).orientations ?? [],
        orientationOtherText: (meSaved as any).orientationOtherText ?? "",
        photos: (meSaved.photos ?? []).map((p: any) => ({
          url: p.url,
          path: p.path,
        })),
      };
    }
    const p: any = profile;

    return {
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      age: profile.age,
      bio: p.bio ?? "",
      relationshipStatus: p.relationshipStatus ?? "",
      genderIdentity: p.genderIdentity ?? "",
      pronouns: p.pronouns ?? "",
      orientations: p.orientations ?? [],
      orientationOtherText: p.orientationOtherText ?? "",
      photos: p.photos ?? [],
    };
  }, [profile, meSaved]);

  const relationshipStatus = (effective?.relationshipStatus ?? "").trim();
  const showRelationshipStatus =
    relationshipStatus !== "" &&
    relationshipStatus.toLowerCase() !== "välj..." &&
    relationshipStatus.toLowerCase() !== "välj...";

  const avatarSrc =
    effective?.avatarUrl || "https://api.dicebear.com/9.x/thumbs/svg?seed=User";

  const mediaItems = useMemo(() => {
    const photos = effective?.photos ?? [];
    return [{ url: avatarSrc }, ...photos.map((p) => ({ url: p.url }))];
  }, [effective?.photos, avatarSrc]);

  const bioText = effective?.bio ?? "";
  const collapsedBio =
    bioText.length > 120 ? bioText.slice(0, 120).trim() + "…" : bioText;
  const orientations: string[] = Array.isArray(effective?.orientations)
    ? effective?.orientations
    : [];

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!effective) return null;
  // ✅ Sista: return guards (efter alla hooks)
  if (!open || !effective) return null;

  function startPm() {
    sendDmRequest(effective.id, effective.name);
    setSent(true);
    setTimeout(() => setSent(false), 1200);
    navigate("/dm"); // visa listan med requests (för demo)
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

      {/* Profil Expanded / Modal container: botten-sheet när collapsed, fullscreen när expanded */}
      <div
        className={[
          "absolute mx-auto w-full max-w-md border bg-background shadow-xl transition-all duration-300",
          expanded
            ? "inset-0 rounded-none" // ✅ fullscreen
            : "inset-x-0 bottom-0 h-[60dvh] rounded-t-2xl overflow-hidden", // ✅ sheet
        ].join(" ")}
      >
        {/* Header i Profil / Header gradient */}
        <div
          className={[
            "relative bg-gradient-to-r from-fuchsia-500/30 via-indigo-500/30 to-sky-500/30",
            expanded ? "h-16" : "h-16",
          ].join(" ")}
        >
          <button
            onClick={close}
            className="absolute right-3 top-3 rounded-md border bg-background/80 px-2 py-1 text-sm hover:bg-muted transition"
          >
            ✕
          </button>
        </div>

        {/* Drag handle / toggle */}
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex-1 w-full justify-center py-2 items-center flex"
          aria-label={expanded ? "Minimera" : "Expandera"}
          title={expanded ? "Minimera" : "Expandera"}
        >
          <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        </button>

        {/* Content */}
        <div className="h-[calc(100%-64px)] overflow-y-auto -mt-5">
          {/* ✅ Mindre “dra upp” i expanded (för att inte klippa avatar) */}
          <div className={(expanded ? "mt-1" : "mt-2") + " p-4 pb-6"}>
            <div className="flex items-center gap-3 padding-5">
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
                {/* // bilden i förhandsvisningen, lilla rutan */}
                <img
                  src={avatarSrc}
                  alt={effective.name}
                  className={[
                    "rounded-full border bg-muted",
                    expanded ? "h-32 w-32" : "h-32 w-32",
                    // ✅ behåll cover men fokusera toppen (slipper halvt huvud)
                    "object-cover object-top",
                  ].join(" ")}
                />
              </button>

              <div className="flex-1">
                <div className="text-xl font-semibold leading-tight">
                  {effective.name}
                  {typeof effective.age === "number" ? (
                    <span className="font-semibold">, {effective.age}</span>
                  ) : null}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {effective.location ? (
                    <span className="rounded-full border px-2 py-0.5">
                      {effective.location}
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

            {/* Överblick med riktig bio */}
            <div className="mt-4 rounded-lg border p-3">
              <div className="text-sm font-medium"></div>
              <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                {expanded
                  ? bioText || "Ingen bio angiven ännu."
                  : collapsedBio ||
                    "Snabb överblick. Tryck “Visa profil” för mer."}
              </div>
            </div>
            {/* // Profildetaljer (endast vid expanded) */}
            {expanded && (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium"></div>

                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {effective.pronouns ? (
                      <span className="rounded-full border px-2 py-0.5 text-muted-foreground">
                        {effective.pronouns}
                      </span>
                    ) : null}

                    {effective.genderIdentity ? (
                      <span className="rounded-full border px-2 py-0.5 text-muted-foreground">
                        {effective.genderIdentity}
                      </span>
                    ) : null}

                    {effective.relationshipStatus ? (
                      <span className="rounded-full border px-2 py-0.5 text-muted-foreground">
                        {effective.relationshipStatus}
                      </span>
                    ) : null}

                    {orientations.length > 0 ? (
                      <span className="rounded-full border px-2 py-0.5 text-muted-foreground">
                        {" "}
                        {orientations.includes("Other") &&
                        effective.orientationOtherText
                          ? `${orientations.filter((x) => x !== "Other").join(", ")}${
                              orientations.length > 1 ? ", " : ""
                            }${effective.orientationOtherText}`
                          : orientations.join(", ")}
                      </span>
                    ) : null}

                    {/* fallback om inget finns */}
                    {!effective.pronouns &&
                    !effective.genderIdentity &&
                    !effective.relationshipStatus &&
                    !(effective.orientations?.length ?? 0) ? (
                      <div className="text-sm text-muted-foreground">
                        Ingen extra info angiven ännu.
                      </div>
                    ) : null}
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
            {/* // Visa profil / Starta PM knappar */}
            <div className="mt-3 flex gap-2 flex-col">
              <button
                onClick={toggleExpanded}
                className="h-11 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition active:scale-[0.99]"
              >
                {expanded ? "Minimera" : "Visa profil"}
              </button>

              <button
                onClick={startPm}
                className="h-11 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition active:scale-[0.99]"
              >
                {sent ? "Förfrågan skickad ✅" : "Starta PM"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media viewer */}
      {mediaOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            className="absolute inset-0 bg-black/80"
            aria-label="Stäng bilder"
            onClick={() => setMediaOpen(false)}
          />
          <div className="absolute inset-0 mx-auto w-full max-w-md bg-background shadow-xl">
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
                    setMediaIndex((i) => Math.min(mediaItems.length - 1, i + 1))
                  }
                  disabled={mediaIndex === mediaItems.length - 1}
                >
                  Nästa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
