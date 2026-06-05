import { useHistoryStore } from "../store/historyStore";
import type { HistoryEntryType } from "../types";

// Convenience hook with filtered views
export const useHistory = (filterType?: HistoryEntryType) => {
  const { entries, removeEntry, clearHistory, clearByType } = useHistoryStore();

  const filtered = filterType
    ? entries.filter((e) => e.type === filterType)
    : entries;

  return {
    entries: filtered,
    allEntries: entries,
    removeEntry,
    clearHistory,
    clearByType,
  };
};