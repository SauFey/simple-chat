import { create } from "zustand";

export type PublicProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
  age?: number;
  isMe?: boolean; // ✅ nytt

  pronouns?: string;
  orientations?: string[];
  orientationOtherText?: string;
  genderIdentity?: string;
  relationshipStatus?: string;

  photos: { url: string; path?: string }[];
};

type UiStore = {
  profileOpen: boolean;
  profileExpanded: boolean;
  selectedProfile: PublicProfile | null;
  openProfile: (p: PublicProfile) => void;
  closeProfile: () => void;
  expandProfile: () => void;
  collapseProfile: () => void;
  toast: { message: string } | null;
  showToast: (message: string) => void;
  clearToast: () => void;
};

export const useUiStore = create<UiStore>((set) => ({
  profileOpen: false,
  profileExpanded: false,
  selectedProfile: null,
  toast: null,
  showToast: (message) => set({ toast: { message } }),
  clearToast: () => set({ toast: null }),

  openProfile: (p) =>
    set({ profileOpen: true, selectedProfile: p, profileExpanded: false }),
  closeProfile: () => set({ profileOpen: false, profileExpanded: false }),
  expandProfile: () => set({ profileExpanded: true }),
  collapseProfile: () => set({ profileExpanded: false }),
}));
