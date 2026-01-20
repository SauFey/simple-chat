import { useEffect, useMemo, useRef, useState } from "react";
import {
  useChatStore,
  type Orientation,
  type Pronouns,
  type GenderIdentityPreset,
  type RelationshipStatus,
} from "../stores/chatStore";

import { uploadAvatar, uploadProfilePhoto } from "../lib/storage";

const ORIENTATION_OPTIONS: { key: Orientation; label: string }[] = [
  { key: "Gay", label: "Gay" },
  { key: "Lesbian", label: "Lesbisk" },
  { key: "Bisexual", label: "Bisexuell" },
  { key: "Pansexual", label: "Pansexuell" },
  { key: "Asexual", label: "Asexuell" },
  { key: "Demisexual", label: "Demisexuell" },
  { key: "Queer", label: "Queer" },
  { key: "Straight", label: "Hetero" },
  { key: "Questioning", label: "Utforskande" },
  { key: "Other", label: "Annat" },
  { key: "PreferNotToSay", label: "Vill inte ange" },
];

const PRONOUN_OPTIONS: Pronouns[] = [
  "Välj…",
  "han/honom",
  "hon/henne",
  "hen",
  "de/dem",
  "annat",
  "vill inte ange",
];

const GENDER_OPTIONS: GenderIdentityPreset[] = [
  "Välj…",
  "kvinna",
  "man",
  "icke-binär",
  "transkvinna",
  "transman",
  "genderfluid",
  "agender",
  "annat",
  "vill inte ange",
];

const REL_STATUS_OPTIONS: RelationshipStatus[] = [
  "Välj…",
  "singel",
  "i relation",
  "gift",
  "förlovad",
  "det är komplicerat",
  "öppet förhållande",
  "vill inte ange",
];

function toggleOrientation(
  current: Orientation[],
  value: Orientation,
): Orientation[] {
  if (value === "PreferNotToSay") return ["PreferNotToSay"];

  const filtered = current.filter((x) => x !== "PreferNotToSay");
  const has = filtered.includes(value);
  const next = has ? filtered.filter((x) => x !== value) : [...filtered, value];

  return next.length === 0 ? ["PreferNotToSay"] : next;
}

function normalizeProfile(p: any) {
  return {
    ...p,
    orientations: [...(p.orientations ?? [])].sort(),
    photos: [...(p.photos ?? [])].map((x: string) =>
      x?.startsWith("blob:") ? "blob" : x,
    ),
    avatarUrl:
      typeof p.avatarUrl === "string" && p.avatarUrl.startsWith("blob:")
        ? "blob"
        : (p.avatarUrl ?? ""),
  };
}

export function Profile() {
  const meDraft = useChatStore((s) => s.meDraft);
  const meSaved = useChatStore((s) => s.meSaved);
  const setMe = useChatStore((s) => s.setMeDraft);
  const saveMe = useChatStore((s) => s.saveMe);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // “Sparat ✅”
  const [savedPulse, setSavedPulse] = useState(false);

  const isDirty = useMemo(() => {
    return (
      JSON.stringify(normalizeProfile(meDraft)) !==
      JSON.stringify(normalizeProfile(meSaved))
    );
  }, [meDraft, meSaved]);

  async function handleSave() {
    if (!isDirty || uploading) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const userId = meDraft.id; // senare: supabase auth user.id

      let nextAvatarUrl = meDraft.avatarUrl ?? "";
      let nextPhotos = [...(meDraft.photos ?? [])];

      // 1) Upload avatar om ny valdes
      if (avatarFile) {
        const publicUrl = await uploadAvatar(userId, avatarFile);
        nextAvatarUrl = publicUrl;
        setAvatarFile(null);

        // revoke blob preview
        if (avatarObjectUrlRef.current?.startsWith("blob:")) {
          URL.revokeObjectURL(avatarObjectUrlRef.current);
          avatarObjectUrlRef.current = null;
        }
      }

      // 2) Upload nya gallery-filer (om några)
      if (galleryFiles.length > 0) {
        // Behåll bara redan-sparade (icke-blob) urls
        const existingNonBlob = nextPhotos.filter(
          (u) => !u.startsWith("blob:"),
        );

        const uploadedUrls: string[] = [];
        for (const f of galleryFiles) {
          const publicUrl = await uploadProfilePhoto(userId, f);
          uploadedUrls.push(publicUrl);
        }
        setGalleryFiles([]);

        // revoke blob previews som låg i photos
        for (const u of nextPhotos) {
          if (u.startsWith("blob:")) {
            URL.revokeObjectURL(u);
            photoObjectUrlsRef.current.delete(u);
          }
        }

        nextPhotos = [...existingNonBlob, ...uploadedUrls];
      }

      // 3) Uppdatera draft med riktiga URL:er och spara
      setMe({ avatarUrl: nextAvatarUrl, photos: nextPhotos });

      // Låt Zustand applicera patchen innan saveMe (minskar race-risk)
      await Promise.resolve();

      saveMe();
      setSavedPulse(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? "Uppladdningen misslyckades.");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!savedPulse) return;
    const t = setTimeout(() => setSavedPulse(false), 1200);
    return () => clearTimeout(t);
  }, [savedPulse]);

  // Blob-URL städning
  const avatarObjectUrlRef = useRef<string | null>(null);
  const photoObjectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }
      for (const url of photoObjectUrlsRef.current) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }
      photoObjectUrlsRef.current.clear();
    };
  }, []);

  const showOther = useMemo(
    () => meDraft.orientations.includes("Other"),
    [meDraft.orientations],
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">Profil</h1>

      {/* TOP: Avatar + grund */}
      <section className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={meDraft.avatarUrl}
            alt={meDraft.name}
            className="h-20 w-20 rounded-full border object-cover"
          />

          <div className="flex-1 space-y-2">
            <div>
              <div className="text-sm font-medium">Smeknamn</div>
              <input
                value={meDraft.name}
                onChange={(e) => setMe({ name: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
                placeholder="Ditt visningsnamn"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setAvatarFile(file);

                  if (avatarObjectUrlRef.current?.startsWith("blob:")) {
                    URL.revokeObjectURL(avatarObjectUrlRef.current);
                    avatarObjectUrlRef.current = null;
                  }

                  const url = URL.createObjectURL(file);
                  avatarObjectUrlRef.current = url;

                  setMe({ avatarUrl: url });
                  e.currentTarget.value = "";
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm font-medium">Ort</div>
            <input
              value={meDraft.location ?? ""}
              onChange={(e) => setMe({ location: e.target.value })}
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
              placeholder="t.ex. Malmö"
            />
          </div>

          <div>
            <div className="text-sm font-medium">Civilstånd</div>
            <select
              value={meDraft.relationshipStatus}
              onChange={(e) =>
                setMe({
                  relationshipStatus: e.target.value as RelationshipStatus,
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
            >
              {REL_STATUS_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">Bio</div>
          <textarea
            value={meDraft.bio ?? ""}
            onChange={(e) => setMe({ bio: e.target.value })}
            className="mt-1 w-full rounded-md border bg-background p-2 text-sm"
            placeholder="Skriv något om dig…"
            rows={3}
          />
        </div>
      </section>

      {/* Fler bilder */}
      <section className="rounded-lg border p-4 space-y-3">
        <div className="font-medium">Bilder</div>
        <div className="text-sm text-muted-foreground">
          Lägg till fler bilder (sparas lokalt i appen just nu).
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(meDraft.photos ?? []).map((url, idx) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={`Bild ${idx + 1}`}
                className="aspect-square w-full rounded-md border object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  // ta bort + revoke om blob
                  const next = meDraft.photos.filter((u) => u !== url);
                  setMe({ photos: next });

                  if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                    photoObjectUrlsRef.current.delete(url);
                  }
                }}
                className="absolute right-1 top-1 rounded-md border bg-background/90 px-2 py-1 text-xs"
                title="Ta bort"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add-tile */}
          <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border text-sm hover:bg-muted transition">
            + Lägg till
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length === 0) return;

                setGalleryFiles((prev) => [...prev, ...files]);

                const previewUrls = files.map((f) => {
                  const u = URL.createObjectURL(f);
                  photoObjectUrlsRef.current.add(u);
                  return u;
                });

                setMe({ photos: [...(meDraft.photos ?? []), ...previewUrls] });
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
      </section>

      {/* Identitet via dropdowns */}
      <section className="rounded-lg border p-4 space-y-3">
        <div className="font-medium">Identitet</div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm font-medium">Pronomen</div>
            <select
              value={meDraft.pronouns}
              onChange={(e) => setMe({ pronouns: e.target.value as Pronouns })}
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
            >
              {PRONOUN_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-sm font-medium">Könsidentitet</div>
            <select
              value={meDraft.genderIdentity}
              onChange={(e) =>
                setMe({
                  genderIdentity: e.target.value as GenderIdentityPreset,
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
            >
              {GENDER_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Sexuell läggning */}
      <section className="rounded-lg border p-4 space-y-3">
        <div className="font-medium">Sexuell läggning</div>
        <div className="text-sm text-muted-foreground">
          Valfritt. Du kan välja flera. “Vill inte ange” är ett privacy-default.
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {ORIENTATION_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2 rounded-md border px-2 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={meDraft.orientations.includes(opt.key)}
                onChange={() =>
                  setMe({
                    orientations: toggleOrientation(
                      meDraft.orientations,
                      opt.key,
                    ),
                  })
                }
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        {showOther && (
          <div>
            <div className="text-sm font-medium">Annat (valfritt)</div>
            <input
              value={meDraft.orientationOtherText ?? ""}
              onChange={(e) => setMe({ orientationOtherText: e.target.value })}
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
              placeholder="Beskriv med egna ord…"
            />
          </div>
        )}
      </section>

      {/* NSFW */}
      <section className="rounded-lg border p-4 flex items-center justify-between">
        <div>
          <div className="font-medium">NSFW</div>
          <div className="text-sm text-muted-foreground">
            Visa innehåll som kan vara 18+
          </div>
        </div>
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={meDraft.nsfwEnabled}
          onChange={(e) => setMe({ nsfwEnabled: e.target.checked })}
        />
      </section>

      {/* Spara */}
      {errorMsg && <div className="text-sm text-red-500">{errorMsg}</div>}
      <button
        onClick={handleSave}
        disabled={!isDirty || uploading}
        className={[
          "h-11 w-full rounded-md border text-sm font-medium transition",
          !isDirty || uploading
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-muted active:scale-[0.99]",
          savedPulse ? "ring-2 ring-offset-2" : "",
        ].join(" ")}
      >
        {uploading ? "Laddar upp…" : savedPulse ? "Sparat ✅" : "Spara"}
      </button>
    </div>
  );
}
