import React from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { formatCoords } from "../../utils/formatters";

interface MapCardProps {
  lat: number;
  lon: number;
  mapsUrl: string;
  city?: string | null;
  country?: string | null;
}

const MapCard: React.FC<MapCardProps> = ({
  lat,
  lon,
  mapsUrl,
  city,
  country,
}) => {
  // Use OpenStreetMap embed (no API key needed)
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lon - 0.1
  },${lat - 0.1},${lon + 0.1},${
    lat + 0.1
  }&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className="cyber-card animate-slide-up overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <MapPin size={15} className="text-cyber-accent" />
          <span className="cyber-label">Location Map</span>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cyber-btn-ghost text-xs py-1.5"
        >
          <ExternalLink size={11} />
          Google Maps
        </a>
      </div>

      {/* Location text */}
      {(city || country) && (
        <div className="px-5 py-2 bg-cyber-surface/50">
          <p className="text-xs font-mono text-cyber-text-dim">
            <span className="text-cyber-accent">◉</span>{" "}
            {[city, country].filter(Boolean).join(", ")} —{" "}
            {formatCoords(lat, lon)}
          </p>
        </div>
      )}

      {/* Map embed */}
      <div className="relative">
        <iframe
          src={embedUrl}
          className="w-full h-48 border-0 opacity-80"
          title="IP Location Map"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
        {/* Cyber overlay tint */}
        <div className="absolute inset-0 pointer-events-none border-t border-cyber-accent/10" />
      </div>
    </div>
  );
};

export default MapCard;