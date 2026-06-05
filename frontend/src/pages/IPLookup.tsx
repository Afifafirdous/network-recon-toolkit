import React, { useState } from "react";
import { Globe, Wifi } from "lucide-react";
import SearchBox from "../components/ui/SearchBox";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import IPResultCard from "../components/results/IPResultCard";
import GeoCard from "../components/results/GeoCard";
import NetworkCard from "../components/results/NetworkCard";
import SecurityCard from "../components/results/SecurityCard";
import MapCard from "../components/results/MapCard";
import { useIPLookup } from "../hooks/useIPLookup";

const IPLookup: React.FC = () => {
  const { data, loading, error, lookup, lookupMyIP, reset } = useIPLookup();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query: string) => {
    setHasSearched(true);
    lookup(query);
  };

  const handleMyIP = () => {
    setHasSearched(true);
    lookupMyIP();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={20} className="text-cyber-accent" />
          <h1 className="text-lg font-mono font-semibold text-cyber-text">
            IP Lookup
          </h1>
        </div>
        <p className="text-sm font-mono text-cyber-text-dim">
          Retrieve geolocation, network, and security information for any IPv4 or IPv6 address.
        </p>
      </div>

      {/* Search section */}
      <div className="cyber-card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBox
              placeholder="Enter IPv4 or IPv6 address…"
              onSearch={handleSearch}
              loading={loading}
              helpText="Examples: 8.8.8.8 · 1.1.1.1 · 2606:4700:4700::1111"
            />
          </div>
          <button
            onClick={handleMyIP}
            disabled={loading}
            className="cyber-btn-ghost justify-center sm:justify-start flex-shrink-0"
          >
            <Wifi size={13} />
            Use My IP
          </button>
        </div>
      </div>

      {/* States */}
      {!hasSearched && !loading && (
        <div className="text-center py-16 text-cyber-text-dim">
          <Globe size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-mono text-sm">
            Enter an IP address above to begin reconnaissance.
          </p>
        </div>
      )}

      {loading && <LoadingSpinner message="Looking up IP address…" />}

      {error && !loading && (
        <ErrorAlert message={error} onRetry={reset} />
      )}

      {data && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {/* IP Overview — full width */}
          <div className="md:col-span-2">
            <IPResultCard data={data} />
          </div>

          {/* Geo */}
          <GeoCard data={data} />

          {/* Network */}
          <NetworkCard data={data} />

          {/* Security — full width */}
          <div className="md:col-span-2">
            <SecurityCard data={data} />
          </div>

          {/* Map — full width (only if coords available) */}
          {data.lat !== null && data.lon !== null && data.mapsUrl && (
            <div className="md:col-span-2">
              <MapCard
                lat={data.lat}
                lon={data.lon}
                mapsUrl={data.mapsUrl}
                city={data.city}
                country={data.country}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IPLookup;