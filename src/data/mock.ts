export type Conversation =
  | { type: "dm"; id: string; title: string; lastMessage: string }
  | { type: "room"; id: string; title: string; lastMessage: string };

export const dmThreads: Conversation[] = [
  {
    type: "dm",
    id: "alex",
    title: "Alex",
    lastMessage: "Ska vi ses på Pride?",
  },
  { type: "dm", id: "sam", title: "Sam", lastMessage: "Haha samma här 😄" },
];

export const rooms: Conversation[] = [
  { type: "room", id: "allmant", title: "Allmänt", lastMessage: "Välkommen!" },
  {
    type: "room",
    id: "stockholm",
    title: "Stockholm",
    lastMessage: "Nån på fika?",
  },
  {
    type: "room",
    id: "gaming",
    title: "Gaming",
    lastMessage: "Ranked ikväll?",
  },
];

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  avatarUrl?: string;
  createdAt: string; // ISO string
};

export const demoUsers = {
  me: {
    id: "me",
    name: "Suss",
    avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=Suss",
  },
  alex: {
    id: "alex",
    name: "Alex",
    avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=Alex",
  },
};

export const roomMessages: Record<string, ChatMessage[]> = {
  allmant: [
    {
      id: "m1",
      text: "Välkommen till rummet! 🌈",
      senderId: "alex",
      senderName: demoUsers.alex.name,
      avatarUrl: demoUsers.alex.avatarUrl,
      createdAt: new Date().toISOString(),
    },
    {
      id: "m2",
      text: "Tack! Kul att vara här 😄",
      senderId: "me",
      senderName: demoUsers.me.name,
      avatarUrl: demoUsers.me.avatarUrl,
      createdAt: new Date().toISOString(),
    },
  ],
};

export const dmMessages: Record<string, ChatMessage[]> = {
  alex: [
    {
      id: "d1",
      text: "Hej 👋",
      senderId: "alex",
      senderName: demoUsers.alex.name,
      avatarUrl: demoUsers.alex.avatarUrl,
      createdAt: new Date().toISOString(),
    },
    {
      id: "d2",
      text: "Tjena! 😄",
      senderId: "me",
      senderName: demoUsers.me.name,
      avatarUrl: demoUsers.me.avatarUrl,
      createdAt: new Date().toISOString(),
    },
  ],
};
