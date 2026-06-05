import { Request, Response, NextFunction } from "express";
import dns from "dns";
import { promisify } from "util";

const VALID_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"] as const;
type RecordType = (typeof VALID_TYPES)[number];

// Force IPv4 preference and use OS resolver as fallback
dns.setDefaultResultOrder("ipv4first");

const lookupAsync = promisify(dns.lookup);

export const dnsLookupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hostname } = req.params;
    const rawType = ((req.query.type as string) || "A").toUpperCase();

    if (!VALID_TYPES.includes(rawType as RecordType)) {
      res.status(400).json({
        error: `Invalid record type "${rawType}". Valid types: ${VALID_TYPES.join(", ")}`,
      });
      return;
    }

    const recordType = rawType as RecordType;
    const records = await resolveRecord(hostname, recordType);

    res.json({
      hostname,
      recordType,
      records,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const nodeErr = err as NodeJS.ErrnoException;

    // ── Handle DNS-blocked network case ────────────────────────
    if (nodeErr.code === "ECONNREFUSED" || nodeErr.code === "ETIMEOUT") {
      res.status(503).json({
        error:
          "DNS queries are blocked on your network. Only basic A-record lookups via the OS resolver are available. Try the 'Domain → IP' tool instead.",
      });
      return;
    }

    if (nodeErr.code === "ENOTFOUND" || nodeErr.code === "ENODATA") {
      res.status(404).json({
        error: `No ${req.query.type || "A"} records found for "${req.params.hostname}"`,
      });
      return;
    }

    next(err);
  }
};

// ── DNS resolution with smart fallback ──────────────────────────
async function resolveRecord(
  hostname: string,
  type: RecordType
): Promise<unknown[]> {
  // Try direct resolution first
  try {
    return await directResolve(hostname, type);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;

    // If DNS is blocked AND user asked for A/AAAA, fall back to OS resolver
    if ((code === "ECONNREFUSED" || code === "ETIMEOUT") &&
        (type === "A" || type === "AAAA")) {
      const family = type === "AAAA" ? 6 : 4;
      const result = await lookupAsync(hostname, { all: true, family });
      return result.map((r) => r.address);
    }

    // For MX, NS, TXT, CNAME, SOA — we can't fall back, so re-throw
    throw err;
  }
}

async function directResolve(
  hostname: string,
  type: RecordType
): Promise<unknown[]> {
  const resolve4 = promisify(dns.resolve4);
  const resolve6 = promisify(dns.resolve6);
  const resolveMx = promisify(dns.resolveMx);
  const resolveNs = promisify(dns.resolveNs);
  const resolveTxt = promisify(dns.resolveTxt);
  const resolveCname = promisify(dns.resolveCname);
  const resolveSoa = promisify(dns.resolveSoa);

  switch (type) {
    case "A":
      return resolve4(hostname);
    case "AAAA":
      return resolve6(hostname);
    case "MX":
      return resolveMx(hostname);
    case "NS":
      return resolveNs(hostname);
    case "TXT":
      return (await resolveTxt(hostname)).map((chunks) => chunks.join(""));
    case "CNAME":
      return resolveCname(hostname);
    case "SOA":
      return [await resolveSoa(hostname)];
    default: {
      const _exhaustive: never = type;
      return [];
    }
  }
}