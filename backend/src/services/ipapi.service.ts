import axios from "axios";

// Using ip-api.com — no API key needed, 100 req/min free
// Pro fields (query,status,message,continent,country,countryCode,
// region,regionName,city,zip,lat,lon,timezone,isp,org,as,
// asname,reverse,mobile,proxy,hosting)

const IP_API_BASE = "http://ip-api.com/json";
const IP_API_FIELDS =
  "status,message,query,continent,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting";

export interface IPApiResponse {
  status: "success" | "fail";
  message?: string;
  query: string;
  continent?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;       // e.g. "AS15169 Google LLC"
  asname?: string;
  reverse?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

export const lookupIP = async (ip: string): Promise<IPApiResponse> => {
  const url = ip === "self" ? `${IP_API_BASE}?fields=${IP_API_FIELDS}` : `${IP_API_BASE}/${ip}?fields=${IP_API_FIELDS}`;

  const response = await axios.get<IPApiResponse>(url, {
    timeout: 8000,
  });

  if (response.data.status === "fail") {
    throw Object.assign(new Error(response.data.message || "IP lookup failed"), {
      statusCode: 400,
    });
  }

  return response.data;
};

// Parse ASN number from AS string like "AS15169 Google LLC"
export const parseASN = (asString: string): { asn: string; name: string } => {
  const match = asString.match(/^(AS\d+)\s+(.*)$/);
  if (match) {
    return { asn: match[1], name: match[2] };
  }
  return { asn: asString, name: "" };
};

// Determine IP version
export const getIPVersion = (ip: string): 4 | 6 => {
  return ip.includes(":") ? 6 : 4;
};