import { create } from "zustand";

import type { Mode } from "@/lib/content";

interface ModeState {
  mode: Mode | null;
  setMode: (mode: Mode | null) => void;
}

export const useMode = create<ModeState>((set) => ({
  mode: null,
  setMode: (mode) => set({ mode }),
}));
