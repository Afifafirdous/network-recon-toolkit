import { Request, Response, NextFunction } from "express";
import { lookupIP, parseASN, getIPVersion } from "../services/ipapi.service";

export const lookupIPHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { address } = req.params;
    const data = await lookupIP(address);

    const asnParsed = data.as ? parseASN(data.as) : null;

    res.json({
      ip: data.query,
      ipVersion: getIPVersion(data.query),
      continent: data.continent,
      country: data.country,
      countryCode: data.countryCode,
      // Flag emoji from country code
      flag: data.countryCode
        ? countryCodeToFlag(data.countryCode)
        : null,
      region: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      asn: asnParsed?.asn || null,
      asnName: asnParsed?.name || null,
      reverseDns: data.reverse,
      isMobile: data.mobile,
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

export const getMyIPHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get caller's IP, accounting for proxies
    const forwarded = req.headers["x-forwarded-for"];
    const callerIP =
      typeof forwarded === "string"
        ? forwarded.split(",")[0].trim()
        : req.socket.remoteAddress || "";

    // For local dev, ip-api returns your real IP when no IP is passed
    const data = await lookupIP("self");

    const asnParsed = data.as ? parseASN(data.as) : null;

    res.json({
      ip: data.query,
      ipVersion: getIPVersion(data.query),
      continent: data.continent,
      country: data.country,
      countryCode: data.countryCode,
      flag: data.countryCode ? countryCodeToFlag(data.countryCode) : null,
      region: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      asn: asnParsed?.asn || null,
      asnName: asnParsed?.name || null,
      reverseDns: data.reverse,
      isMobile: data.mobile,
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

// Convert ISO 3166-1 alpha-2 country code to flag emoji
const countryCodeToFlag = (code: string): string => {
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};