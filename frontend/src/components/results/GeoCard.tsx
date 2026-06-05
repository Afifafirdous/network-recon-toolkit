import React from "react";
import { MapPin, Clock, Globe2 } from "lucide-react";
import CopyButton from "../ui/CopyButton";
import { formatCoords } from "../../utils/formatters";
import type { IPResult } from "../../types";

interface GeoCardProps {
  data: Pick<
    IPResult,
    | "country"
    | "countryCode"
    | "continent"
    | "region"
    | "city"
    | "zip"
    | "lat"
    | "lon"
    | "timezone"
    | "mapsUrl"
  >;
}

const Row: React.FC<{ label: string; value: string | null | undefined; copyable?: boolean }> = ({
  label,
  value,
  copyable = false,
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-cyber-border/50 last:border-0 gap-3">
      <span className="cyber-label flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className="cyber-value">{value}</span>
        {copyable && <CopyButton text={value} />}
      </div>
    </div>
  );
};

const GeoCard: React.FC<GeoCardProps> = ({ data }) => {
  const coordString =
    data.lat !== null && data.lon !== null
      ? formatCoords(data.lat, data.lon)
      : null;

  return (
    <div className="cyber-card animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={15} className="text-cyber-accent" />
        <span className="cyber-label">Geolocation</span>
      </div>

      <div className="divide-y divide-transparent">
        <Row label="Continent" value={data.continent} />
        <Row label="Country" value={data.country} />
        <Row label="Country Code" value={data.countryCode} />
        <Row label="Region" value={data.region} />
        <Row label="City" value={data.city} />
        <Row label="ZIP / Postal" value={data.zip} />
        <Row label="Coordinates" value={coordString} copyable />
        <Row label="Timezone" value={data.timezone} />
      </div>

      {data.mapsUrl && (
        <a
          href={data.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 text-xs font-mono text-cyber-accent hover:underline"
        >
          <Globe2 size={12} />
          Open in Google Maps ↗
        </a>
      )}
    </div>
  );
};

export default GeoCard;