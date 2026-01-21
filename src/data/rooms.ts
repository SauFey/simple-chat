export const ROOMS = [
  { id: "general", name: "Allmänt" },
  { id: "girls", name: "Tjejsnack" },
  { id: "boys", name: "Killsnack" },
] as const;

export type RoomId = (typeof ROOMS)[number]["id"];
