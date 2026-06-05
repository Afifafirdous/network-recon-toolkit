import { Request, Response, NextFunction } from "express";
import dns from "dns";
import { promisify } from "util";
import { lookupIP, parseASN, getIPVersion } from "../services/ipapi.service";

// Use dns.lookup (uses OS resolver, more reliable cross-platform)
// instead of dns.resolve4 (uses raw DNS protocol, can fail on Windows)
const lookupAsync = promisify(dns.lookup);
const resolve4Async = promisify(dns.resolve4);
const resolve6Async = promisify(dns.resolve6);

// Force IPv4 preference globally for consistency
dns.setDefaultResultOrder("ipv4first");

export const domainToIPHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hostname } = req.params;

    // ── Multi-strategy DNS resolution ───────────────────────────
    let addresses: string[] = [];
    let resolutionMethod = "";

    // Strategy 1: dns.resolve4
    try {
      addresses = await resolve4Async(hostname);
      resolutionMethod = "resolve4";
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      // Silently fall through on common "DNS blocked" errors
      if (code !== "ECONNREFUSED" && code !== "ETIMEOUT") {
        console.warn(`[DNS] resolve4 failed for ${hostname}: ${code}`);
      }
    }

    // Strategy 2: dns.resolve6
    if (addresses.length === 0) {
      try {
        addresses = await resolve6Async(hostname);
        resolutionMethod = "resolve6";
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code !== "ECONNREFUSED" && code !== "ETIMEOUT") {
          console.warn(`[DNS] resolve6 failed for ${hostname}: ${code}`);
        }
      }
    }

    // Strategy 3: dns.lookup (final fallback)
    if (addresses.length === 0) {
      try {
        const result = await lookupAsync(hostname, { all: true });
        addresses = result.map((r) => r.address);
        resolutionMethod = "lookup";
      } catch (err) {
        console.warn(`[DNS] lookup failed for ${hostname}:`, (err as Error).message);
      }
    }

    // ── All strategies failed ───────────────────────────────────
    if (addresses.length === 0) {
      res.status(404).json({
        error: `Could not resolve hostname: ${hostname}. The domain may not exist or your DNS server may be unreachable.`,
      });
      return;
    }

    console.log(
      `[DNS] Resolved ${hostname} → ${addresses.length} IP(s) via ${resolutionMethod}`
    );

    // ── Geo-locate the primary IP ───────────────────────────────
    const primaryIP = addresses[0];
    const data = await lookupIP(primaryIP);
    const asnParsed = data.as ? parseASN(data.as) : null;

    res.json({
      hostname,
      resolvedIPs: addresses,
      primaryIP,
      ipVersion: getIPVersion(primaryIP),
      country: data.country,
      countryCode: data.countryCode,
      flag: data.countryCode
        ? data.countryCode
            .toUpperCase()
            .split("")
            .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
            .join("")
        : null,
      region: data.regionName,
      city: data.city,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      asn: asnParsed?.asn || null,
      asnName: asnParsed?.name || null,
      isProxy: data.proxy,
      isHosting: data.hosting,
      mapsUrl:
        data.lat && data.lon
          ? `https://www.google.com/maps?q=${data.lat},${data.lon}`
          : null,
    });
  } catch (err) {
    next(err);
  }
};