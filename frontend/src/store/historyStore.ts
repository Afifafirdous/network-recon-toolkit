import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryEntry, HistoryEntryType } from "../types";

const MAX_HISTORY = 50;

interface HistoryStore {
  entries: HistoryEntry[];
  addEntry: (
    type: HistoryEntryType,
    query: string,
    resultSummary: string,
    subQuery?: string
  ) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  clearByType: (type: HistoryEntryType) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (type, query, resultSummary, subQuery) => {
        set((state) => {
          // Avoid duplicate consecutive entries
          const last = state.entries[0];
          if (last && last.type === type && last.query === query && last.subQuery === subQuery) {
            return state;
          }

          const newEntry: HistoryEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type,
            query,
            subQuery,
            timestamp: Date.now(),
            resultSummary,
          };

          return {
            entries: [newEntry, ...state.entries].slice(0, MAX_HISTORY),
          };
        });
      },

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      clearHistory: () => set({ entries: [] }),

      clearByType: (type) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.type !== type),
        })),
    }),
    {
      name: "recon-toolkit-history",
    }
  )
);