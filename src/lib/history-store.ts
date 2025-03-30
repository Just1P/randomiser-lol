import { create } from 'zustand';
import { Player } from '@/types/player';
import { v4 as uuidv4 } from 'uuid';

// Structure representing an entry in history
export interface HistoryEntry {
  id: string;         // Unique ID for this entry
  timestamp: number;  // Creation timestamp
  team: Player[];     // The team composition
  includesChampions: boolean; // If champions were included
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id'>) => void;
  clearHistory: () => void;
  deleteEntry: (id: string) => void;
}

// Local storage key
const HISTORY_STORAGE_KEY = 'randomizer-history';

// Maximum number of entries to keep in history
const MAX_HISTORY_ENTRIES = 20;

// Load history from localStorage
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

// Save history to localStorage
const saveHistoryToStorage = (entries: HistoryEntry[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

// Create Zustand store
export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: loadHistoryFromStorage(),
  
  // Add a new entry to history
  addEntry: (entry) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: uuidv4()
    };
    
    // Get current entries and add the new one
    const updatedEntries = [newEntry, ...get().entries];
    
    // Limit the number of entries in history
    const limitedEntries = updatedEntries.slice(0, MAX_HISTORY_ENTRIES);
    
    // Update state and save
    set({ entries: limitedEntries });
    saveHistoryToStorage(limitedEntries);
  },
  
  // Delete a specific entry
  deleteEntry: (id: string) => {
    const updatedEntries = get().entries.filter(entry => entry.id !== id);
    set({ entries: updatedEntries });
    saveHistoryToStorage(updatedEntries);
  },
  
  // Clear all history
  clearHistory: () => {
    set({ entries: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }
}));

// Utility function to format a date from a timestamp
export const formatHistoryDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  
  // Format: "5 May 12:34" or "Today 12:34"
  const isToday = new Date().toDateString() === date.toDateString();
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  if (isToday) {
    return `Aujourd'hui ${timeStr}`;
  }
  
  // Month names in French
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${timeStr}`;
}; 