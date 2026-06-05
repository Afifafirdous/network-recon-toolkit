import { useState, useCallback } from "react";
import { api } from "../api/client";
import { useHistoryStore } from "../store/historyStore";
import type { DNSResult, DNSRecordType, AsyncState } from "../types";

export const useDNSLookup = () => {
  const [state, setState] = useState<AsyncState<DNSResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const addEntry = useHistoryStore((s) => s.addEntry);

  const lookup = useCallback(
    async (hostname: string, type: DNSRecordType = "A") => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await api.dns.lookup(hostname, type);
        setState({ data: result, loading: false, error: null });

        addEntry(
          "dns",
          hostname,
          `${type} records — ${Array.isArray(result.records) ? result.records.length : 1} result(s)`,
          type
        );
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : "DNS lookup failed",
        });
      }
    },
    [addEntry]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, lookup, reset };
};