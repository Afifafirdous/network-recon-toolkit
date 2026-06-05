// ── IP Lookup ───────────────────────────────────────────────────
export interface IPResult {
  ip: string;
  ipVersion: 4 | 6;
  continent: string | null;
  country: string | null;
  countryCode: string | null;
  flag: string | null;
  region: string | null;
  city: string | null;
  zip: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  isp: string | null;
  org: string | null;
  asn: string | null;
  asnName: string | null;
  reverseDns: string | null;
  isMobile: boolean | null;
  isProxy: boolean | null;
  isHosting: boolean | null;
  mapsUrl: string | null;
}

// ── Domain Lookup ───────────────────────────────────────────────
export interface DomainResult {
  hostname: string;
  resolvedIPs: string[];
  primaryIP: string;
  ipVersion: 4 | 6;
  country: string | null;
  countryCode: string | null;
  flag: string | null;
  region: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  isp: string | null;
  org: string | null;
  asn: string | null;
  asnName: string | null;
  isProxy: boolean | null;
  isHosting: boolean | null;
  mapsUrl: string | null;
}

// ── DNS Lookup ──────────────────────────────────────────────────
export type DNSRecordType = "A" | "AAAA" | "MX" | "NS" | "TXT" | "CNAME" | "SOA";

export interface MXRecord {
  exchange: string;
  priority: number;
}

export interface SOARecord {
  nsname: string;
  hostmaster: string;
  serial: number;
  refresh: number;
  retry: number;
  expire: number;
  minttl: number;
}

export interface DNSResult {
  hostname: string;
  recordType: DNSRecordType;
  records: string[] | MXRecord[] | SOARecord[];
  timestamp: string;
}

// ── ASN Lookup ──────────────────────────────────────────────────
export interface ASNResult {
  asn: string;
  asnNumber: number;
  name: string;
  description: string;
  countryCode: string;
  website: string | null;
  abuseContacts: string[];
  rir: string | null;
  dateAllocated: string | null;
  trafficEstimation: string | null;
}

// ── History ─────────────────────────────────────────────────────
export type HistoryEntryType = "ip" | "domain" | "dns" | "asn";

export interface HistoryEntry {
  id: string;
  type: HistoryEntryType;
  query: string;
  subQuery?: string; // e.g. DNS record type
  timestamp: number;
  resultSummary: string; // Short description for display
}

// ── API State ───────────────────────────────────────────────────
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}