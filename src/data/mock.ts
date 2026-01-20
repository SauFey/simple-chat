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
