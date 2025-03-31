import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '@/enums/role';

export interface HistoryEntry {
  id: string;
  date: string;
  players: {
    name: string;
    role?: Role;
    champion?: string;
  }[];
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'date'>) => void;
  deleteEntry: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => {
        set((state) => ({
          entries: [
            {
              ...entry,
              id: crypto.randomUUID(),
              date: new Date().toLocaleDateString(),
            },
            ...state.entries,
          ],
        }));
      },
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },
      clearHistory: () => {
        set({ entries: [] });
      },
    }),
    {
      name: 'history-storage',
    }
  )
); 