import { Request, Response, NextFunction } from "express";
import axios from "axios";

// ── RIPEstat API ─────────────────────────────────────────────────
// Free, no API key, official European Internet Registry
// Docs: https://stat.ripe.net/docs/02.data-api/

type RIPEOverviewResponse = {
  status: string;
  data: {
    holder: string;
    announced: boolean;
    type: string;
    block: {
      resource: string;
      desc: string;
      name: string;
    };
    resource: string;
  };
};

type RIPEGeolocResponse = {
  status: string;
  data: {
    located_resources?: Array<{
      locations?: Array<{
        country: string;
      }>;
    }>;
  };
};

type RIPEContactResponse = {
  status: string;
  data: {
    abuse_contacts?: string[];
  };
};

export const asnLookupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawASN = req.params.asn.toUpperCase();
    const asnNumber = rawASN.replace(/^AS/i, "");

    // ── Run all three RIPE queries in parallel ────────────────
    const [overviewRes, geoRes, contactRes] = await Promise.allSettled([
      axios.get<RIPEOverviewResponse>(
        `https://stat.ripe.net/data/as-overview/data.json`,
        { params: { resource: `AS${asnNumber}` }, timeout: 8000 }
      ),
      axios.get<RIPEGeolocResponse>(
        `https://stat.ripe.net/data/maxmind-geo-lite/data.json`,
        { params: { resource: `AS${asnNumber}` }, timeout: 8000 }
      ),
      axios.get<RIPEContactResponse>(
        `https://stat.ripe.net/data/abuse-contact-finder/data.json`,
        { params: { resource: `AS${asnNumber}` }, timeout: 8000 }
      ),
    ]);

    // ── Extract overview (this is required) ───────────────────
    if (overviewRes.status !== "fulfilled") {
      res.status(503).json({
        error: "Could not reach RIPEstat API. The service may be temporarily unavailable.",
      });
      return;
    }

    const overview = overviewRes.value.data;

    if (overview.status !== "ok" || !overview.data.holder) {
      res.status(404).json({ error: `ASN ${rawASN} not found in RIPEstat database` });
      return;
    }

    // ── Extract optional data ──────────────────────────────────
    let countryCode: string | null = null;
    if (geoRes.status === "fulfilled" && geoRes.value.data.data.located_resources?.[0]) {
      countryCode = geoRes.value.data.data.located_resources[0].locations?.[0]?.country || null;
    }

    let abuseContacts: string[] = [];
    if (contactRes.status === "fulfilled") {
      abuseContacts = contactRes.value.data.data.abuse_contacts || [];
    }

    // ── Parse holder string ────────────────────────────────────
    // RIPE format: "GOOGLE - Google LLC, US" or just "CLOUDFLARENET, US"
    const holder = overview.data.holder;
    const holderParts = holder.split(/\s*-\s*/);
    const name = holderParts[0]?.trim() || holder;
    const description = holderParts[1]?.replace(/,\s*[A-Z]{2}$/, "").trim() || name;

    res.json({
      asn: `AS${asnNumber}`,
      asnNumber: Number(asnNumber),
      name,
      description,
      countryCode: countryCode || "—",
      website: null, // RIPEstat doesn't provide this
      abuseContacts,
      rir: overview.data.block?.name || null,
      dateAllocated: null, // Available via different endpoint if needed
      trafficEstimation: null,
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const code = err.code;

      if (code === "ECONNABORTED") {
        res.status(504).json({ error: "RIPEstat API request timed out." });
        return;
      }

      if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
        res.status(503).json({
          error: "Could not reach RIPEstat. Network DNS may be blocked.",
        });
        return;
      }
    }

    next(err);
  }
};