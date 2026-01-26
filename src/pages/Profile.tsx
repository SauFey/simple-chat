import { useEffect, useMemo, useRef, useState } from "react";
import {
  useChatStore,
  canChangeGender,
  genderRemainingMs,
  ORIENTATION,
  PRONOUN_OPTIONS,
  GENDER_OPTIONS,
  REL_STATUS_OPTIONS,
} from "@/stores/chatStore";

import {
  uploadAvatar,
  uploadProfilePhoto,
  deleteProfilePhoto,
  deleteAvatar,
} from "../lib/storage";
import { X } from "lucide-react";
import { ProjectionNodeConfig } from "framer-motion";

const ORIENTATION_OPTIONS: { key: ORIENTATION; label: string }[] = [
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

export type Pronouns = (typeof PRONOUN_OPTIONS)[number];

export type GenderIdentityPreset = (typeof GENDER_OPTIONS)[number];

export type RelationshipStatus = (typeof REL_STATUS_OPTIONS)[number];

function toggleOrientation(
  current: ORIENTATION[],
  value: ORIENTATION,
): ORIENTATION[] {
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
    photos: [...(p.photos ?? [])].map((X: any) => ({
      url:
        typeof X.url === "string" && X.url.startsWith("blob:")
          ? "blob"
          : (X.url ?? ""),
      path: X.path ?? "",
    })),
    avatarUrl:
      typeof p.avatarUrl === "string" && p.avatarUrl.startsWith("blob:")
        ? "blob"
        : (p.avatarUrl ?? ""),
  };
}

const MAX_PHOTOS = 6;

export function Profile() {
  const meDraft = useChatStore((s) => s.meDraft);
  const meSaved = useChatStore((s) => s.meSaved);
  const setMe = useChatStore((s) => s.setMeDraft);
  const saveMe = useChatStore((s) => s.saveMe);
  const remaining = MAX_PHOTOS - (meDraft.photos?.length ?? 0);
  const limitedFiles = meDraft.photos?.slice(0, Math.max(0, remaining));
  const isGuest = meSaved.accountType === "guest";
  const genderLocked = !canChangeGender(meSaved);
  const remainingMs = genderRemainingMs(meSaved);
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // “Sparat ✅”S
  const [savedPulse, setSavedPulse] = useState(false);

  const avatarSrc =
    meDraft.avatar?.url || "https://api.dicebear.com/9.x/thumbs/svg?seed=User";

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

      let nextAvatar = meDraft.avatar ?? null;
      let nextPhotos = [...(meDraft.photos ?? [])];

      // 1) Upload avatar om ny valdes
      if (avatarFile) {
        const uploaded = await uploadAvatar(userId, avatarFile);

        // ✅ RADERA GAMLA AVATAREN (om den fanns i storage)
        const oldPath = meSaved.avatar?.path;
        const newPath = uploaded.path;

        if (oldPath && oldPath !== newPath) {
          await deleteAvatar(oldPath);
        }

        nextAvatar = uploaded;
        setAvatarFile(null);

        // revoke blob preview (om du använder det)
        if (avatarObjectUrlRef.current?.startsWith("blob:")) {
          URL.revokeObjectURL(avatarObjectUrlRef.current);
          avatarObjectUrlRef.current = null;
        }
      }

      // gallery
      if (galleryFiles.length > 0) {
        const existingNonBlob = nextPhotos.filter(
          (p) => !p.url.startsWith("blob:"),
        );
        const uploadedItems = [];
        for (const f of galleryFiles) {
          uploadedItems.push(await uploadProfilePhoto(userId, f));
        }
        setGalleryFiles([]);

        // revoke blob previews
        for (const p of nextPhotos) {
          if (p.url.startsWith("blob:")) {
            URL.revokeObjectURL(p.url);
            photoObjectUrlsRef.current.delete(p.url);
          }
        }

        nextPhotos = [...existingNonBlob, ...uploadedItems];
      }

      setMe({ avatar: nextAvatar, photos: nextPhotos });
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
            src={avatarSrc}
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

                  setMe({ avatar: { url, path: "" } });
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
            <div className="text-sm font-medium">Ålder</div>
            <input
              type="number"
              min={18}
              max={99}
              value={meDraft.age ?? ""}
              onChange={(e) =>
                setMe({
                  age:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
              placeholder="t.ex. 29"
            />
          </div>

          <div>
            <div className="text-sm font-medium">Civilstånd</div>
            <select
              value={meDraft.relationshipStatus ?? ""}
              onChange={(e) =>
                setMe({
                  relationshipStatus: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
            >
              <option value="">Välj…</option>
              <option value="Single">Singel</option>
              <option value="Dating">Dejtar</option>
              <option value="In a relationship">I relation</option>
              <option value="Engaged">Förlovad</option>
              <option value="Married">Gift</option>
              <option value="It&#39;s complicated">Det är komplicerat</option>
            </select>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">Om mig</div>
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
      {!isGuest && (
        <section className="rounded-lg border p-3 text-sm text-muted-foreground">
          Gästkonton kan bara ha profilbild. Claima ditt konto för att lägga
          till fler bilder.
          <div className="font-medium">Galleri</div>
          <div className="text-sm text-muted-foreground">
            Lägg till fler bilder (sparas lokalt i appen just nu).
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(meDraft.photos ?? []).map((photo, idx) => (
              <div key={photo.url + idx} className="relative">
                <img
                  src={photo.url}
                  alt={`Bild ${idx + 1}`}
                  className="aspect-square w-full rounded-md border object-cover"
                />
                <button
                  type="button"
                  onClick={async () => {
                    // Ta bort från UI direkt (snappy), sen storage
                    const next = (meDraft.photos ?? []).filter(
                      (p) => p !== photo,
                    );
                    setMe({ photos: next });

                    // Revoke blob preview om det var en blob
                    if (photo.url.startsWith("blob:")) {
                      URL.revokeObjectURL(photo.url);
                      photoObjectUrlsRef.current.delete(photo.url);
                      return; // ingen storage-delete behövs
                    }

                    // Om den har path: radera från storage
                    try {
                      await deleteProfilePhoto(photo.path);
                    } catch (e) {
                      console.error(e);
                      // (valfritt) här kan du lägga tillbaka fotot om delete failar
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

                  const previewItems = files.map((f) => {
                    const u = URL.createObjectURL(f);
                    photoObjectUrlsRef.current.add(u);
                    return { url: u, path: "" };
                  });

                  setMe({
                    photos: [...(meDraft.photos ?? []), ...previewItems],
                  });

                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </section>
      )}
      {/* Identitet via dropdowns */}
      <section className="rounded-lg border p-4 space-y-3">
        <div className="font-medium">Identitet</div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm font-medium">Pronomen</div>
            <select
              value={meDraft.pronouns ?? ""}
              onChange={(e) => setMe({ pronouns: e.target.value })}
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm disabled:opacity-60"
            >
              {PRONOUN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-sm font-medium">Könsidentitet</div>
            <select
              value={meDraft.genderIdentity ?? ""}
              disabled={genderLocked}
              onChange={(e) => setMe({ genderIdentity: e.target.value })}
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm disabled:opacity-60"
            >
              <option value="">Välj…</option>
              <option value="Kvinna">Kvinna</option>
              <option value="Man">Man</option>
              <option value="Icke-binär">Icke-binär</option>
              <option value="Annat">Annat</option>
            </select>

            {genderLocked && (
              <div className="mt-1 text-xs text-muted-foreground">
                Du kan ändra igen om cirka {remainingDays} dag(ar).
              </div>
            )}
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

      <section className="rounded-lg border p-3 flex items-center justify-between">
        <div>
          <div className="font-medium">Tillåt PM från andra</div>
          <div className="text-sm text-muted-foreground">
            Om av kan ingen starta en ny PM-tråd med dig. Du kan fortfarande
            själv starta PM.
          </div>
        </div>

        <input
          type="checkbox"
          className="h-5 w-5"
          checked={meDraft.allowIncomingDms}
          onChange={(e) => setMe({ allowIncomingDms: e.target.checked })}
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
