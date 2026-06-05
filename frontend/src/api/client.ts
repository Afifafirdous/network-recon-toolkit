import axios, { AxiosError } from "axios";

const client = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Normalize API errors into readable messages
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: string; details?: string[] }>) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.details?.join(", ") ||
      (error.code === "ECONNABORTED" ? "Request timed out" : null) ||
      (error.code === "ERR_NETWORK" ? "Cannot reach server. Is the backend running?" : null) ||
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  }
);

export default client;

// ── Typed API functions ──────────────────────────────────────────
import type {
  IPResult,
  DomainResult,
  DNSResult,
  DNSRecordType,
  ASNResult,
} from "../types";

export const api = {
  ip: {
    lookup: (address: string) =>
      client.get<IPResult>(`/ip/${encodeURIComponent(address)}`).then((r) => r.data),
    myIP: () =>
      client.get<IPResult>("/ip/me").then((r) => r.data),
  },

  domain: {
    lookup: (hostname: string) =>
      client.get<DomainResult>(`/domain/${encodeURIComponent(hostname)}`).then((r) => r.data),
  },

  dns: {
    lookup: (hostname: string, type: DNSRecordType = "A") =>
      client.get<DNSResult>(`/dns/${encodeURIComponent(hostname)}`, {
        params: { type },
      }).then((r) => r.data),
  },

  asn: {
    lookup: (asn: string) =>
      client.get<ASNResult>(`/asn/${encodeURIComponent(asn)}`).then((r) => r.data),
  },
};