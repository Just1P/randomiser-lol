import { create } from 'zustand';
import { Player } from '@/types/player';
import { v4 as uuidv4 } from 'uuid';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  team: Player[];
  includesChampions: boolean;
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id'>) => void;
  clearHistory: () => void;
  deleteEntry: (id: string) => void;
}

const HISTORY_STORAGE_KEY = 'randomizer-history';
const MAX_HISTORY_ENTRIES = 20;

const loadHistoryFromStorage = (): HistoryEntry[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
      return JSON.parse(storedHistory);
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
  
  return [];
};

const saveHistoryToStorage = (entries: HistoryEntry[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: loadHistoryFromStorage(),
  
  addEntry: (entry) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: uuidv4()
    };
    
    const updatedEntries = [newEntry, ...get().entries];
    const limitedEntries = updatedEntries.slice(0, MAX_HISTORY_ENTRIES);
    
    set({ entries: limitedEntries });
    saveHistoryToStorage(limitedEntries);
  },
  
  deleteEntry: (id: string) => {
    const updatedEntries = get().entries.filter(entry => entry.id !== id);
    set({ entries: updatedEntries });
    saveHistoryToStorage(updatedEntries);
  },
  
  clearHistory: () => {
    set({ entries: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }
}));

export const formatHistoryDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  
  const isToday = new Date().toDateString() === date.toDateString();
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  if (isToday) {
    return `Aujourd'hui ${timeStr}`;
  }
  
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${timeStr}`;
};
