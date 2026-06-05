import { useState, useCallback } from "react";
import { api } from "../api/client";
import { useHistoryStore } from "../store/historyStore";
import type { IPResult, AsyncState } from "../types";

export const useIPLookup = () => {
  const [state, setState] = useState<AsyncState<IPResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const addEntry = useHistoryStore((s) => s.addEntry);

  const lookup = useCallback(async (ip: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await api.ip.lookup(ip);
      setState({ data: result, loading: false, error: null });

      addEntry(
        "ip",
        ip,
        `${result.city || "Unknown city"}, ${result.country || "Unknown"}`
      );
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "Lookup failed",
      });
    }
  }, [addEntry]);

  const lookupMyIP = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await api.ip.myIP();
      setState({ data: result, loading: false, error: null });

      addEntry(
        "ip",
        result.ip,
        `${result.city || "Unknown"}, ${result.country || "Unknown"}`
      );
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "Could not detect IP",
      });
    }
  }, [addEntry]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, lookup, lookupMyIP, reset };
};