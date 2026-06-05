import React, { useEffect } from "react";
import { Wifi, RefreshCw } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import IPResultCard from "../components/results/IPResultCard";
import GeoCard from "../components/results/GeoCard";
import NetworkCard from "../components/results/NetworkCard";
import SecurityCard from "../components/results/SecurityCard";
import MapCard from "../components/results/MapCard";
import { useIPLookup } from "../hooks/useIPLookup";

const MyIP: React.FC = () => {
  const { data, loading, error, lookupMyIP } = useIPLookup();

  // Auto-fetch on mount
  useEffect(() => {
    lookupMyIP();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Wifi size={20} className="text-cyber-accent" />
            <h1 className="text-lg font-mono font-semibold text-cyber-text">
              My IP
            </h1>
          </div>
          <p className="text-sm font-mono text-cyber-text-dim">
            Your current public IP address and network information.
          </p>
        </div>

        <button
          onClick={lookupMyIP}
          disabled={loading}
          className="cyber-btn-ghost flex-shrink-0"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading && <LoadingSpinner message="Detecting your IP…" />}

      {error && !loading && (
        <ErrorAlert message={error} onRetry={lookupMyIP} />
      )}

      {data && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <div className="md:col-span-2">
            <IPResultCard data={data} />
          </div>
          <GeoCard data={data} />
          <NetworkCard data={data} />
          <div className="md:col-span-2">
            <SecurityCard data={data} />
          </div>
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

export default MyIP;