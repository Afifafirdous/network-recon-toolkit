import React, { useState } from "react";
import { Server, ChevronDown } from "lucide-react";
import SearchBox from "../components/ui/SearchBox";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import CopyButton from "../components/ui/CopyButton";
import Badge from "../components/ui/Badge";
import { useDNSLookup } from "../hooks/useDNSLookup";
import { formatTimestamp } from "../utils/formatters";
import type { DNSRecordType, MXRecord, SOARecord } from "../types";

const DNS_TYPES: DNSRecordType[] = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"];

const RecordTypeDescriptions: Record<DNSRecordType, string> = {
  A:     "IPv4 address records",
  AAAA:  "IPv6 address records",
  MX:    "Mail exchange servers",
  NS:    "Name servers",
  TXT:   "Text records (SPF, DKIM…)",
  CNAME: "Canonical name aliases",
  SOA:   "Start of authority",
};

const DNSLookup: React.FC = () => {
  const [selectedType, setSelectedType] = useState<DNSRecordType>("A");
  const { data, loading, error, lookup, reset } = useDNSLookup();

  const handleSearch = (query: string) => {
    lookup(query, selectedType);
  };

  const renderRecord = (record: unknown, index: number): React.ReactNode => {
    if (typeof record === "string") {
      return (
        <div key={index} className="flex items-center justify-between py-2.5 border-b border-cyber-border/40 last:border-0">
          <span className="font-mono text-sm text-cyber-text break-all">{record}</span>
          <CopyButton text={record} />
        </div>
      );
    }

    // MX Record
    if (typeof record === "object" && record !== null && "exchange" in record) {
      const mx = record as MXRecord;
      return (
        <div key={index} className="flex items-center justify-between py-2.5 border-b border-cyber-border/40 last:border-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Badge variant="info">{mx.priority}</Badge>
            <span className="font-mono text-sm text-cyber-text break-all">{mx.exchange}</span>
          </div>
          <CopyButton text={mx.exchange} />
        </div>
      );
    }

    // SOA Record
    if (typeof record === "object" && record !== null && "nsname" in record) {
      const soa = record as SOARecord;
      return (
        <div key={index} className="py-2 space-y-1.5">
          {Object.entries(soa).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-xs font-mono py-1 border-b border-cyber-border/30 last:border-0">
              <span className="text-cyber-text-dim uppercase tracking-wider">{key}</span>
              <span className="text-cyber-text">{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Server size={20} className="text-cyber-accent" />
          <h1 className="text-lg font-mono font-semibold text-cyber-text">
            DNS Lookup
          </h1>
        </div>
        <p className="text-sm font-mono text-cyber-text-dim">
          Query DNS records for any domain. Supports A, AAAA, MX, NS, TXT, CNAME, and SOA.
        </p>
      </div>

      {/* Search + Record Type */}
      <div className="cyber-card mb-6">
        {/* Record type selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {DNS_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-md font-mono text-xs transition-all border ${
                selectedType === type
                  ? "bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30"
                  : "text-cyber-text-dim border-cyber-border hover:border-cyber-accent/30 hover:text-cyber-text"
              }`}
              title={RecordTypeDescriptions[type]}
            >
              {type}
            </button>
          ))}
        </div>

        <SearchBox
          placeholder="Enter domain name…"
          onSearch={handleSearch}
          loading={loading}
          helpText={`Looking up ${selectedType} records — ${RecordTypeDescriptions[selectedType]}`}
        />
      </div>

      {!data && !loading && !error && (
        <div className="text-center py-16 text-cyber-text-dim">
          <Server size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-mono text-sm">
            Select a record type and enter a domain to query DNS.
          </p>
        </div>
      )}

      {loading && <LoadingSpinner message={`Querying ${selectedType} records…`} />}
      {error && !loading && <ErrorAlert message={error} onRetry={reset} />}

      {data && !loading && (
        <div className="cyber-card animate-slide-up">
          {/* Result header */}
          <div className="flex items-start justify-between mb-4 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="info">{data.recordType}</Badge>
                <span className="font-mono text-base font-semibold text-cyber-accent">
                  {data.hostname}
                </span>
              </div>
              <p className="text-xs font-mono text-cyber-text-dim">
                {RecordTypeDescriptions[data.recordType]} · Queried at{" "}
                {formatTimestamp(new Date(data.timestamp).getTime())}
              </p>
            </div>
            <Badge variant={data.records.length > 0 ? "success" : "neutral"}>
              {data.records.length} record{data.records.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Records */}
          {data.records.length === 0 ? (
            <p className="text-sm font-mono text-cyber-text-dim text-center py-6">
              No {data.recordType} records found for {data.hostname}
            </p>
          ) : (
            <div>
              {data.records.map((record, i) => renderRecord(record, i))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DNSLookup;