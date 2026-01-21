import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  genderIdentity: GenderIdentityPreset;
  relationshipStatus: RelationshipStatus;

  orientations: Orientation[];
  orientationOtherText?: string;

  nsfwEnabled: boolean;
  allowIncomingDms: boolean;
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

  sendRoomMessage: (roomId: string, text: string) => void;
  sendDmMessage: (dmId: string, text: string) => void;

  ensureRoom: (roomId: string) => void;
  ensureDm: (dmId: string, opts?: { initiatedByMe?: boolean }) => void;

  hydrateProfile: (profile: MeProfile) => void;

  roomPresence: Record<string, number>;
  onlineCount: number;
  setRoomPresence: (roomId: string, count: number) => void;
  setOnlineCount: (count: number) => void;
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

  orientations: ["PreferNotToSay"],
  orientationOtherText: "",
  nsfwEnabled: false,
  allowIncomingDms: true,
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

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      meSaved: defaultMe(),
      meDraft: defaultMe(),

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

      setMeDraft: (patch) =>
        set((state) => ({
          meDraft: { ...state.meDraft, ...patch },
        })),

      saveMe: () =>
        set((state) => ({
          meSaved: { ...state.meDraft },
        })),

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
          if (state.roomMessages[roomId]) return state;
          return {
            roomMessages: {
              ...state.roomMessages,
              [roomId]: [],
            },
          };
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
