import { create } from 'zustand';

interface StoreState {
  cache: Record<string, any[]>;
  setCache: (path: string, files: any[]) => void;
  invalidateCache: (path: string) => void;
  clearCache: () => void;
}

export const useStore = create<StoreState>((set) => ({
  cache: {},
  setCache: (path, files) => set((state) => ({ cache: { ...state.cache, [path]: files } })),
  invalidateCache: (path) => set((state) => {
    const newCache = { ...state.cache };
    delete newCache[path];
    return { cache: newCache };
  }),
  clearCache: () => set({ cache: {} }),
}));
