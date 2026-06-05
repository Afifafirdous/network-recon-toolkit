import React, { useState } from "react";
import { Search, Globe2, Network, ExternalLink } from "lucide-react";
import SearchBox from "../components/ui/SearchBox";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import GeoCard from "../components/results/GeoCard";
import NetworkCard from "../components/results/NetworkCard";
import SecurityCard from "../components/results/SecurityCard";
import CopyButton from "../components/ui/CopyButton";
import Badge from "../components/ui/Badge";
import { api } from "../api/client";
import { useHistoryStore } from "../store/historyStore";
import type { DomainResult, AsyncState } from "../types";

const DomainLookup: React.FC = () => {
  const [state, setState] = useState<AsyncState<DomainResult>>({
    data: null,
    loading: false,
    error: null,
  });
  const addEntry = useHistoryStore((s) => s.addEntry);

  const handleSearch = async (query: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await api.domain.lookup(query);
      setState({ data: result, loading: false, error: null });
      addEntry(
        "domain",
        query,
        `${result.primaryIP} — ${result.city || "?"}, ${result.country || "?"}`
      );
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "Domain lookup failed",
      });
    }
  };

  const { data, loading, error } = state;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search size={20} className="text-cyber-accent" />
          <h1 className="text-lg font-mono font-semibold text-cyber-text">
            Domain → IP
          </h1>
        </div>
        <p className="text-sm font-mono text-cyber-text-dim">
          Resolve a domain name to its IP address and retrieve full geolocation data.
        </p>
      </div>

      {/* Search */}
      <div className="cyber-card mb-6">
        <SearchBox
          placeholder="Enter domain name…"
          onSearch={handleSearch}
          loading={loading}
          helpText="Examples: google.com · cloudflare.com · github.com"
        />
      </div>

      {!data && !loading && !error && (
        <div className="text-center py-16 text-cyber-text-dim">
          <Search size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-mono text-sm">
            Enter a domain name to resolve it and investigate.
          </p>
        </div>
      )}

      {loading && <LoadingSpinner message="Resolving domain…" />}
      {error && !loading && (
        <ErrorAlert message={error} onRetry={() => setState({ ...state, error: null })} />
      )}

      {data && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Domain overview card */}
          <div className="cyber-card">
            <div className="flex items-center gap-2 mb-4">
              <Globe2 size={15} className="text-cyber-accent" />
              <span className="cyber-label">Domain Resolution</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {data.flag && (
                <span className="text-2xl" role="img" aria-label={data.country || ""}>
                  {data.flag}
                </span>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xl font-semibold text-cyber-accent">
                    {data.hostname}
                  </span>
                  <Badge variant="info">IPv{data.ipVersion}</Badge>
                </div>
                <p className="text-sm font-mono text-cyber-text-dim mt-0.5">
                  {data.city}, {data.country}
                </p>
              </div>
            </div>

            {/* All resolved IPs */}
            <div>
              <p className="cyber-label mb-2">
                Resolved IP{data.resolvedIPs.length > 1 ? "s" : ""} (
                {data.resolvedIPs.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {data.resolvedIPs.map((ip) => (
                  <div
                    key={ip}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm border ${
                      ip === data.primaryIP
                        ? "bg-cyber-accent/10 border-cyber-accent/30 text-cyber-accent"
                        : "bg-cyber-surface border-cyber-border text-cyber-text"
                    }`}
                  >
                    {ip}
                    {ip === data.primaryIP && (
                      <Badge variant="info">Primary</Badge>
                    )}
                    <CopyButton text={ip} />
                  </div>
                ))}
              </div>
            </div>

            {data.mapsUrl && (
              <a
                href={data.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-cyber-accent hover:underline"
              >
                <ExternalLink size={11} />
                Open in Google Maps
              </a>
            )}
          </div>

          {/* Geo + Network */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GeoCard data={{ ...data, zip: null, continent: null, timezone: data.timezone }} />
            <NetworkCard data={data} />
          </div>

          {/* Security */}
          <SecurityCard
            data={{
              isProxy: data.isProxy,
              isHosting: data.isHosting,
              isMobile: null,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DomainLookup;