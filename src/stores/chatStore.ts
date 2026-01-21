import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicProfile } from "@/stores/uiStore";

export type Orientation =
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

export type Pronouns =
  | "Välj…"
  | "han/honom"
  | "hon/henne"
  | "hen"
  | "de/dem"
  | "annat"
  | "vill inte ange";

export type GenderIdentityPreset =
  | "Välj…"
  | "kvinna"
  | "man"
  | "icke-binär"
  | "transkvinna"
  | "transman"
  | "genderfluid"
  | "agender"
  | "annat"
  | "vill inte ange";

export type RelationshipStatus =
  | "Välj…"
  | "singel"
  | "i relation"
  | "gift"
  | "förlovad"
  | "det är komplicerat"
  | "öppet förhållande"
  | "vill inte ange";

export type DmRequest = {
  id: string; // request id
  fromUserId: string;
  fromName: string;
  fromAvatarUrl?: string;
  createdAt: string; // ISO
};

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

  pronouns: Pronouns;
  genderIdentity?: string;
  relationshipStatus: RelationshipStatus;
  genderChangedAt?: string; // ISO när kön senast ändrades
  genderLocked?: boolean;
  remainingMs?: number;

  orientations: Orientation[];
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

  pronouns: "Välj…",
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
    orientations: Array.isArray(p?.orientations)
      ? p.orientations
      : d.orientations,

    allowIncomingDms:
      typeof p?.allowIncomingDms === "boolean"
        ? p.allowIncomingDms
        : d.allowIncomingDms,
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

          return {
            meSaved: next,
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
