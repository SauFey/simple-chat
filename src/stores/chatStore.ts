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
  avatarUrl?: string;

  // NYTT: fler bilder
  photos: string[]; // objectURLs eller framtida riktiga URL:er

  bio?: string;
  location?: string;

  pronouns: Pronouns;
  genderIdentity: GenderIdentityPreset;
  relationshipStatus: RelationshipStatus;

  orientations: Orientation[];
  orientationOtherText?: string;

  nsfwEnabled: boolean;
};

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  avatarUrl?: string;
  createdAt: string; // ISO
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
  ensureDm: (dmId: string) => void;

  hydrateProfile: (profile: MeProfile) => void;
};

function uid() {
  // Bra nog för frontend-mock. Byt till crypto.randomUUID() om du vill.
  return Math.random().toString(36).slice(2, 10);
}

const defaultMe = (): MeProfile => ({
  id: "me",
  name: "Suss",
  avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=Suss",

  photos: [],

  bio: "",
  location: "",

  pronouns: "Välj…",
  genderIdentity: "Välj…",
  relationshipStatus: "Välj…",

  orientations: ["PreferNotToSay"],
  orientationOtherText: "",
  nsfwEnabled: false,
});

const withDefaults = (p: Partial<MeProfile> | undefined): MeProfile => {
  const d = defaultMe();

  const merged: MeProfile = {
    ...d,
    ...(p ?? {}),
    // skydda arrays
    photos: Array.isArray(p?.photos) ? p!.photos : d.photos,
    orientations: Array.isArray(p?.orientations)
      ? p!.orientations
      : d.orientations,
  };

  // skydda dropdowns så de alltid har giltiga värden
  if (!merged.pronouns) merged.pronouns = d.pronouns;
  if (!merged.genderIdentity) merged.genderIdentity = d.genderIdentity;
  if (!merged.relationshipStatus)
    merged.relationshipStatus = d.relationshipStatus;

  // skydda boolean
  if (typeof (p as any)?.nsfwEnabled !== "boolean")
    merged.nsfwEnabled = d.nsfwEnabled;

  return merged;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      meSaved: defaultMe(),
      meDraft: defaultMe(),

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

      ensureDm: (dmId) =>
        set((state) => {
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
          avatarUrl: meSaved.avatar,
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
          avatarUrl: meSaved.avatarUrl,
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

        // Uppdatera store-state “på riktigt” via set (säkrare än att mutera state direkt)
        state.meSaved = migrated;
        state.meDraft = { ...migrated };
      },
    },
  ),
);
