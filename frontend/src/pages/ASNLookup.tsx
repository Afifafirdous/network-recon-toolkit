import React, { useState } from "react";
import { Building2, Globe2, Mail, Calendar, Activity } from "lucide-react";
import SearchBox from "../components/ui/SearchBox";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import Badge from "../components/ui/Badge";
import CopyButton from "../components/ui/CopyButton";
import { api } from "../api/client";
import { useHistoryStore } from "../store/historyStore";
import type { ASNResult, AsyncState } from "../types";

const Row: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: string | null | undefined;
  copyable?: boolean;
}> = ({ icon, label, value, copyable = false }) => {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-cyber-border/50 last:border-0 gap-3">
      <div className="flex items-center gap-2 flex-shrink-0">
        {icon && <span className="text-cyber-text-dim">{icon}</span>}
        <span className="cyber-label">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-right min-w-0">
        <span className="cyber-value break-all">{value}</span>
        {copyable && <CopyButton text={value} />}
      </div>
    </div>
  );
};

const ASNLookup: React.FC = () => {
  const [state, setState] = useState<AsyncState<ASNResult>>({
    data: null,
    loading: false,
    error: null,
  });
  const addEntry = useHistoryStore((s) => s.addEntry);

  const handleSearch = async (query: string) => {
    // Auto-prepend AS if user types just a number
    const normalized = /^\d+$/.test(query.trim()) ? `AS${query.trim()}` : query.trim();

    setState({ data: null, loading: true, error: null });
    try {
      const result = await api.asn.lookup(normalized);
      setState({ data: result, loading: false, error: null });
      addEntry("asn", normalized, `${result.name} — ${result.countryCode}`);
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "ASN lookup failed",
      });
    }
  };

  const { data, loading, error } = state;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 size={20} className="text-cyber-accent" />
          <h1 className="text-lg font-mono font-semibold text-cyber-text">
            ASN Lookup
          </h1>
        </div>
        <p className="text-sm font-mono text-cyber-text-dim">
          Look up Autonomous System Number details including organization, RIR, and traffic data.
        </p>
      </div>

      {/* Search */}
      <div className="cyber-card mb-6">
        <SearchBox
          placeholder="Enter ASN (e.g. AS15169 or 15169)…"
          onSearch={handleSearch}
          loading={loading}
          helpText="Examples: AS15169 (Google) · AS13335 (Cloudflare) · AS32934 (Meta)"
        />
      </div>

      {!data && !loading && !error && (
        <div className="text-center py-16 text-cyber-text-dim">
          <Building2 size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-mono text-sm">
            Enter an ASN to look up organization and network details.
          </p>
        </div>
      )}

      {loading && <LoadingSpinner message="Querying BGPView…" />}
      {error && !loading && (
        <ErrorAlert
          message={error}
          onRetry={() => setState({ ...state, error: null })}
        />
      )}

      {data && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* ASN Overview */}
          <div className="cyber-card">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-cyber-accent" />
                <span className="cyber-label">AS Information</span>
              </div>
              {data.rir && <Badge variant="neutral">{data.rir}</Badge>}
            </div>

            {/* ASN + Name */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-2xl font-bold text-cyber-accent">
                  {data.asn}
                </span>
                <CopyButton text={data.asn} />
              </div>
              <p className="font-mono text-base text-cyber-text">{data.name}</p>
              {data.description && data.description !== data.name && (
                <p className="font-mono text-sm text-cyber-text-dim mt-0.5">
                  {data.description}
                </p>
              )}
            </div>

            <div>
              <Row
                icon={<Globe2 size={12} />}
                label="Country"
                value={data.countryCode}
              />
              <Row
                icon={<Calendar size={12} />}
                label="Allocated"
                value={data.dateAllocated}
              />
              <Row
                icon={<Activity size={12} />}
                label="Traffic"
                value={data.trafficEstimation}
              />
              {data.website && (
                <div className="flex items-center justify-between py-2.5 border-b border-cyber-border/50">
                  <div className="flex items-center gap-2">
                    <Globe2 size={12} className="text-cyber-text-dim" />
                    <span className="cyber-label">Website</span>
                  </div>
                  <a
                    href={
                      data.website.startsWith("http")
                        ? data.website
                        : `https://${data.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-cyber-accent hover:underline break-all text-right"
                  >
                    {data.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Abuse contacts */}
          {data.abuseContacts.length > 0 && (
            <div className="cyber-card">
              <div className="flex items-center gap-2 mb-4">
                <Mail size={15} className="text-cyber-warning" />
                <span className="cyber-label">Abuse Contacts</span>
              </div>
              <div className="space-y-2">
                {data.abuseContacts.map((contact) => (
                  <div key={contact} className="flex items-center justify-between">
                    <a
                      href={`mailto:${contact}`}
                      className="font-mono text-sm text-cyber-text-dim hover:text-cyber-accent transition-colors"
                    >
                      {contact}
                    </a>
                    <CopyButton text={contact} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ASNLookup;