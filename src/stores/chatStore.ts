import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicProfile } from "@/stores/uiStore";
import { promises } from "dns";

export type ORIENTATION =
  | "Gay"
  | "Lesbian"
  | "Bisexual"
  | "Pansexual"
  | "Asexual"
  | "Demisexual"
  | "Queer"
  | "Straight"
  | "Questioning"
  | "Other"
  | "PreferNotToSay";

export const PRONOUN_OPTIONS = [
  { value: "", label: "Välj…" },
  { value: "han_honom", label: "Han/Honom" },
  { value: "hon_henne", label: "Hon/Henne" },
  { value: "hen", label: "Hen" },
  { value: "de_dem", label: "De/Dem" },
  { value: "annat", label: "Annat" },
  { value: "vill_inte_ange", label: "Vill inte ange" },
] as const;

export type Pronouns = (typeof PRONOUN_OPTIONS)[number]["value"];

export const GENDER_OPTIONS = [
  { value: "", label: "Välj…" },
  { value: "kvinna", label: "Kvinna" },
  { value: "man", label: "Man" },
  { value: "icke_binar", label: "Icke-binär" },
  { value: "transkvinna", label: "Transkvinna" },
  { value: "transman", label: "Transman" },
  { value: "genderfluid", label: "Genderfluid" },
  { value: "agender", label: "Agender" },
  { value: "annat", label: "Annat" },
  { value: "vill_inte_ange", label: "Vill inte ange" },
] as const;

export type GenderIdentityPreset = (typeof GENDER_OPTIONS)[number]["value"];

export const REL_STATUS_OPTIONS = [
  { value: "", label: "Välj…" },
  { value: "singel", label: "Singel" },
  { value: "i_en_relation", label: "I en relation" },
  { value: "gift", label: "Gift" },
  { value: "forlovad", label: "Förlovad" },
  { value: "komplicerat", label: "Det är komplicerat" },
  { value: "oppet_forhallande", label: "Öppet förhållande" },
  { value: "vill_inte_ange", label: "Vill inte ange" },
] as const;

export type RelationshipStatus = (typeof REL_STATUS_OPTIONS)[number]["value"];

export type AccountType = "guest" | "member" | "verified";
export type MeProfile = {
  id: string;
  name: string;
  avatar?: StoredImage | null;
  age?: number;

  // NYTT: fler bilder
  photos: StoredImage[]; // objectURLs eller framtida riktiga URL:er

  bio?: string;
  location?: string;

  pronouns?: string;
  genderIdentity?: string;
  relationshipStatus?: string;
  genderChangedAt?: string; // ISO när kön senast ändrades
  genderLocked?: boolean;
  remainingMs?: number;

  orientations: ORIENTATION[];
  orientationOtherText?: string;

  nsfwEnabled: boolean;
  allowIncomingDms: boolean;

  accountType: AccountType;
  guestExpiresAt?: string; // ISO datetime
};

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  avatarUrl?: string;
  createdAt: string; // ISO
};

export type StoredImage = {
  url: string;
  path: string; // storage path i bucket
};

type ChatStore = {
  meSaved: MeProfile;
  meDraft: MeProfile;

  setMeDraft: (patch: Partial<MeProfile>) => void;
  saveMe: () => void;
  resetMeDraft: () => void;

  roomMessages: Record<string, ChatMessage[]>;
  dmMessages: Record<string, ChatMessage[]>;

  roomParticipants: Record<string, PublicProfile[]>;
  setRoomParticipants: (roomId: string, users: PublicProfile[]) => void;

  sendRoomMessage: (roomId: string, text: string) => void;
  sendDmMessage: (dmId: string, text: string) => void;

  ensureRoom: (roomId: string) => void;
  ensureDm: (dmId: string, opts?: { initiatedByMe?: boolean }) => void;

  hydrateProfile: (profile: MeProfile) => void;

  roomPresence: Record<string, number>;
  onlineCount: number;
  setRoomPresence: (roomId: string, count: number) => void;
  setOnlineCount: (count: number) => void;

  dmRequests: DmRequest[];
  sendDmRequest: (toUserId: string, toName: string) => void;
  acceptDmRequest: (requestId: string) => void;
  declineDmRequest: (requestId: string) => void;

  blockedUserIds: string[];
  blockUser: (userId: string) => void;

  resetGuest: () => void;
  resetGuestAccount: (opts?: { preferName?: string }) => {
    name: string;
    kept: boolean;
  };
};

export type DmRequest = {
  id: string; // request id
  fromUserId: string;
  fromName: string;
  fromAvatarUrl?: string;
  createdAt: string; // ISO
};

function uid() {
  // Bra nog för frontend-mock. Byt till crypto.randomUUID() om du vill.
  return Math.random().toString(36).slice(2, 10);
}

const defaultMe = (): MeProfile => ({
  id: "me",
  name: "Suss",
  avatar: {
    url: "https://api.dicebear.com/9.x/thumbs/svg?seed=Suss",
    path: "", // tom = extern/default (inte i storage)
  },
  age: undefined,

  photos: [],

  bio: "",
  location: "",

  pronouns: "Välj..",
  genderIdentity: "Välj…",
  relationshipStatus: "Välj…",
  genderChangedAt: undefined,

  orientations: ["PreferNotToSay"],
  orientationOtherText: "",
  nsfwEnabled: false,
  allowIncomingDms: true,

  accountType: "guest",
  guestExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
});

const withDefaults = (p: any): MeProfile => {
  const d = defaultMe();

  // Gamla avatarUrl -> nya avatar
  const avatarFromOld =
    typeof p?.avatarUrl === "string" ? { url: p.avatarUrl, path: "" } : null;

  // Gamla photos: string[] -> nya photos: StoredImage[]
  const photosFromOld =
    Array.isArray(p?.photos) && typeof p.photos[0] === "string"
      ? (p.photos as string[]).map((u) => ({ url: u, path: "" }))
      : null;

  return {
    ...d,
    ...(p ?? {}),
    avatar: (p?.avatar ?? avatarFromOld ?? d.avatar) as any,
    photos: (Array.isArray(p?.photos)
      ? p.photos
      : (photosFromOld ?? d.photos)) as any,
    orientations: Array.isArray(p.orientations)
      ? p.orientations
      : ["PreferNotToSay"],

    allowIncomingDms:
      typeof p?.allowIncomingDms === "boolean"
        ? p.allowIncomingDms
        : d.allowIncomingDms,

    relationshipStatus:
      typeof p?.relationshipStatus === "string"
        ? p.relationshipStatus
        : typeof p?.relationshipStatus === "string"
          ? p.relationshipStatus
          : d.relationshipStatus,

    genderIdentity:
      typeof p?.genderIdentity === "string"
        ? p.genderIdentity
        : d.genderIdentity,

    pronouns: typeof p?.pronouns === "string" ? p.pronouns : d.pronouns,
  };
};

function isGuestExpired(me: MeProfile) {
  if (me.accountType !== "guest") return false;
  if (!me.guestExpiresAt) return false;
  return Date.now() > new Date(me.guestExpiresAt).getTime();
}

const GENDER_COOLDOWN_DAYS = 7;

function genderCooldownMs() {
  return GENDER_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}

function normName(name: string) {
  // Normalisera namn
  return name.trim().toLowerCase();
}

function isNameAvailable(
  get: () => any,
  desiredName: string,
  excludeUserId?: string,
) {
  // Är namnet ledigt?
  const desired = normName(desiredName);
  if (!desired) return false;

  const state = get();
  // Kolla mot alla deltagare som vi känner till (demo)
  const participantsByRoom = state.roomParticipants ?? {};

  const all = Object.values(participantsByRoom).flat() as Array<{
    id?: string;
    name?: string;
  }>;

  const taken = new Set(
    all
      .filter((u) => u.id !== excludeUserId) // ✅ ignorera mig själv
      .map((u) => normName(u.name ?? ""))
      .filter(Boolean),
  );

  // Kolla även mot “me” (för säkerhets skull)
  taken.add(normName(state.meSaved?.name ?? ""));

  return !taken.has(desired);
}

function randomGuestName() {
  // Generera slumpnamn
  const words = [
    "Bubblegum",
    "Neon",
    "Moon",
    "Pixel",
    "Velvet",
    "Aurora",
    "Koi",
    "Nimbus",
  ];
  const w = words[Math.floor(Math.random() * words.length)];
  const n = Math.floor(10 + Math.random() * 90); // 10–99
  return `${w}${n}`;
}

export function canChangeGender(meSaved: { genderChangedAt?: string }) {
  if (!meSaved.genderChangedAt) return true;
  const last = new Date(meSaved.genderChangedAt).getTime();
  return Date.now() - last >= genderCooldownMs();
}

export function genderRemainingMs(meSaved: { genderChangedAt?: string }) {
  if (!meSaved.genderChangedAt) return 0;
  const last = new Date(meSaved.genderChangedAt).getTime();
  const remaining = genderCooldownMs() - (Date.now() - last);
  return Math.max(0, remaining);
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      meSaved: defaultMe(),
      meDraft: defaultMe(),
      dmRequests: [],
      blockedUserIds: [],

      roomPresence: {
        general: 12,
        girls: 7,
        boys: 9,
      },
      onlineCount: 23,

      setRoomPresence: (roomId, count) =>
        set((s) => ({
          roomPresence: { ...s.roomPresence, [roomId]: count },
        })),

      setOnlineCount: (count) => set(() => ({ onlineCount: count })),

      roomParticipants: {},
      setRoomParticipants: (roomId, users) =>
        set((s) => ({
          roomParticipants: { ...s.roomParticipants, [roomId]: users },
        })),
      setMeDraft: (patch) =>
        set((state) => ({
          meDraft: { ...state.meDraft, ...patch },
        })),

      saveMe: () =>
        set((state) => {
          const prev = state.meSaved;
          const next = { ...state.meDraft };

          const genderChanged =
            (prev.genderIdentity ?? "") !== (next.genderIdentity ?? "");

          // Om användaren försöker ändra under cooldown: neka (behåll gamla)
          if (genderChanged && !canChangeGender(prev)) {
            next.genderIdentity = prev.genderIdentity; // revert bara den
            // (valfritt) du kan också sätta en ui-flagga för toast
          }

          // Om ändring är tillåten och faktiskt ändrades: stämpla
          if (genderChanged && canChangeGender(prev)) {
            next.genderChangedAt = new Date().toISOString();
          } else {
            // behåll tidigare timestamp om ingen ny ändring
            next.genderChangedAt = prev.genderChangedAt;
          }

          if (
            typeof (next as any).relationshipStatus === "string" &&
            ["välj...", "välj…", "choose...", "choose…"].includes(
              (next as any).relationshipStatus.trim().toLowerCase(),
            )
          ) {
            (next as any).relationshipStatus = "";
          }

          return {
            meSaved: { ...state.meDraft },
            meDraft: { ...next }, // så UI syncar efter save
          };
        }),

      resetMeDraft: () =>
        set((state) => ({
          meDraft: { ...state.meSaved },
        })),

      // ✅ LÄGG DEN HÄR
      hydrateProfile: (profile) =>
        set(() => ({
          meSaved: profile,
          meDraft: { ...profile },
        })),

      roomMessages: {
        allmant: [
          {
            id: "m1",
            text: "Välkommen till rummet! 🌈",
            senderId: "alex",
            senderName: "Alex",
            avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=Alex",
            createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          },
        ],
      },

      dmMessages: {
        alex: [
          {
            id: "d1",
            text: "Hej 👋",
            senderId: "alex",
            senderName: "Alex",
            avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=Alex",
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
        ],
      },

      ensureRoom: (roomId) =>
        set((state) => {
          const hasMessages = !!state.roomMessages[roomId];
          const hasParticipants = !!state.roomParticipants[roomId];

          const next: any = {};
          if (!hasMessages)
            next.roomMessages = { ...state.roomMessages, [roomId]: [] };

          if (!hasParticipants) {
            // MVP: mock-deltagare (byt senare till riktig presence)
            next.roomParticipants = {
              ...state.roomParticipants,
              [roomId]: [
                {
                  id: "sam",
                  name: "Sam",
                  avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=Sam",
                  location: "Stockholm",
                  age: 29,
                },
                {
                  id: "alex",
                  name: "Alex",
                  avatarUrl:
                    "https://api.dicebear.com/9.x/thumbs/svg?seed=Alex",
                  location: "Göteborg",
                  age: 26,
                },
              ],
            };
          }

          return Object.keys(next).length ? next : state;
        }),

      ensureDm: (dmId, opts) =>
        set((state) => {
          const initiatedByMe = opts?.initiatedByMe ?? false;

          // Om någon annan försöker starta en DM med mig och jag har stängt av:
          if (!initiatedByMe && state.meSaved.allowIncomingDms === false) {
            return state; // gör ingenting
          }

          if (state.dmMessages[dmId]) return state;

          return {
            dmMessages: {
              ...state.dmMessages,
              [dmId]: [],
            },
          };
        }),

      sendRoomMessage: (roomId, text) => {
        const msgText = text.trim();
        if (!msgText) return;

        const { meSaved } = get();
        const msg: ChatMessage = {
          id: Math.random().toString(36).slice(2, 10),
          text: msgText,
          senderId: meSaved.id,
          senderName: meSaved.name,
          avatarUrl: meSaved.avatar?.url,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          roomMessages: {
            ...state.roomMessages,
            [roomId]: [...(state.roomMessages[roomId] ?? []), msg],
          },
        }));
      },

      sendDmMessage: (dmId, text) => {
        const msgText = text.trim();
        if (!msgText) return;

        const { meSaved } = get();
        const msg: ChatMessage = {
          id: Math.random().toString(36).slice(2, 10),
          text: msgText,
          senderId: meSaved.id,
          senderName: meSaved.name,
          avatarUrl: meSaved.avatar?.url,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          dmMessages: {
            ...state.dmMessages,
            [dmId]: [...(state.dmMessages[dmId] ?? []), msg],
          },
        }));
      },

      sendDmRequest: (toUserId, toName) =>
        set((state) => {
          // om mottagaren blockat dig (lokalt kan vi bara blocka utgående i din klient,
          // men vi håller logiken ändå)
          if (state.blockedUserIds.includes(toUserId)) return state;

          // skapa request som om "du" skickar till någon annan.
          // I riktig multi-user värld hamnar den hos mottagaren via backend.
          // För MVP kan vi lägga den i en lokal “inkorg” för demo (eller i en mock).
          const req: DmRequest = {
            id: crypto.randomUUID(),
            fromUserId: state.meSaved.id,
            fromName: state.meSaved.name,
            fromAvatarUrl: state.meSaved.avatar?.url,
            createdAt: new Date().toISOString(),
          };

          // MVP: lägg request i din egen lista så du kan bygga UI:t och flödet.
          return { dmRequests: [req, ...state.dmRequests] };
        }),

      acceptDmRequest: (requestId) =>
        set((state) => {
          const req = state.dmRequests.find((r) => r.id === requestId);
          if (!req) return state;

          const dmId = req.fromUserId;
          return {
            dmRequests: state.dmRequests.filter((r) => r.id !== requestId),
            dmMessages: state.dmMessages[dmId]
              ? state.dmMessages
              : { ...state.dmMessages, [dmId]: [] },
          };
        }),

      declineDmRequest: (requestId) =>
        set((state) => ({
          dmRequests: state.dmRequests.filter((r) => r.id !== requestId),
        })),

      blockUser: (userId) =>
        set((state) => ({
          blockedUserIds: Array.from(
            new Set([...state.blockedUserIds, userId]),
          ),
          dmRequests: state.dmRequests.filter((r) => r.fromUserId !== userId),
        })),

      resetGuest: () =>
        set(() => {
          const fresh = defaultMe();
          const now = new Date().toISOString(); // se till att den verkligen blir guest och får ny tidsstämpel
          const next = {
            ...fresh,
            accountType: "guest" as const,
            guestCreatedAt: now,
            // om du har expiresAt i din modell, sätt den också:
            // guestExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 *1000).toISOString(),
          };

          return {
            meSaved: next,
            meDraft: { ...next },
            // valfritt: töm chatthistoriken om guest gick ut
            roomMessages: {},
            dmMessages: {},
            dmRequests: [],
            blockedUserIds: [],
          };
        }),
      resetGuestAccount: (opts) => {
        const prefer = opts?.preferName?.trim() ?? "";
        const now = new Date().toISOString();
        const currentId = get().meSaved?.id;

        // välj namn
        let name = "";
        let kept = false;

        if (prefer && isNameAvailable(get, prefer, currentId)) {
          name = prefer;
          kept = true;
        } else {
          // försök generera ett ledigt namn (några försök)
          for (let i = 0; i < 8; i++) {
            const candidate = randomGuestName();
            if (isNameAvailable(get, candidate)) {
              name = candidate;
              break;
            }
          }
          if (!name) name = randomGuestName(); // fallback även om “allt är taget” lokalt
        }

        const fresh = defaultMe();
        const next = {
          ...fresh,
          accountType: "guest" as const,
          guestCreatedAt: now,
          name,
        };

        set(() => ({
          meSaved: next,
          meDraft: { ...next },

          // valfritt men rimligt: rensa historik när guest går ut
          roomMessages: {},
          dmMessages: {},
          dmRequests: [],
          blockedUserIds: [],
        }));

        return { name, kept };
      },
    }),
    {
      name: "simple-chat-store",
      // Vi persisterar bara profilen, inte meddelanden (för att inte fylla localStorage)
      partialize: (state) => ({
        meSaved: state.meSaved,
      }),
      // När vi laddar sparad profil: synka draft också
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const migrated = withDefaults(state.meSaved as any);
        state.hydrateProfile(migrated);
      },
    },
  ),
);
