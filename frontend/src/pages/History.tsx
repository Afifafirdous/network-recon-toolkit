import React, { useState } from "react";
import {
  History as HistoryIcon,
  Globe,
  Wifi,
  Search,
  Server,
  Building2,
  Trash2,
  X,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "../store/historyStore";
import { formatRelativeTime, formatTimestamp } from "../utils/formatters";
import Badge from "../components/ui/Badge";
import type { HistoryEntryType } from "../types";

const typeConfig: Record<
  HistoryEntryType,
  { icon: React.FC<{ size?: number }>; label: string; route: string; badge: "info" | "success" | "warning" | "neutral" }
> = {
  ip:     { icon: Globe,     label: "IP Lookup",   route: "/ip-lookup",     badge: "info"    },
  domain: { icon: Search,    label: "Domain",      route: "/domain-lookup", badge: "success" },
  dns:    { icon: Server,    label: "DNS",         route: "/dns-lookup",    badge: "warning" },
  asn:    { icon: Building2, label: "ASN",         route: "/asn-lookup",    badge: "neutral" },
};

const History: React.FC = () => {
  const { entries, removeEntry, clearHistory } = useHistoryStore();
  const [filter, setFilter] = useState<HistoryEntryType | "all">("all");
  const navigate = useNavigate();

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.type === filter);

  const handleRerun = (entry: (typeof entries)[0]) => {
    const config = typeConfig[entry.type];
    navigate(config.route, {
      state: { query: entry.query, subQuery: entry.subQuery },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <HistoryIcon size={20} className="text-cyber-accent" />
            <h1 className="text-lg font-mono font-semibold text-cyber-text">
              Search History
            </h1>
          </div>
          <p className="text-sm font-mono text-cyber-text-dim">
            {entries.length} saved{" "}
            {entries.length === 1 ? "lookup" : "lookups"} — stored locally in
            your browser.
          </p>
        </div>

        {entries.length > 0 && (
          <button
            onClick={clearHistory}
            className="cyber-btn-ghost text-cyber-danger border-cyber-danger/30 hover:bg-cyber-danger/10 hover:border-cyber-danger"
          >
            <Trash2 size={13} />
            Clear All
          </button>
        )}
      </div>

      {/* Filter tabs */}
      {entries.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "ip", "domain", "dns", "asn"] as const).map((type) => {
            const count =
              type === "all"
                ? entries.length
                : entries.filter((e) => e.type === type).length;
            if (type !== "all" && count === 0) return null;

            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs transition-all border ${
                  filter === type
                    ? "bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30"
                    : "text-cyber-text-dim border-cyber-border hover:border-cyber-accent/30 hover:text-cyber-text"
                }`}
              >
                {type === "all" ? "All" : typeConfig[type].label}{" "}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center py-20">
          <Clock size={40} className="mx-auto mb-3 text-cyber-text-dim opacity-20" />
          <p className="font-mono text-sm text-cyber-text-dim">
            No history yet. Run a lookup to see it here.
          </p>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-2">
        {filtered.map((entry) => {
          const config = typeConfig[entry.type];
          const Icon = config.icon;

          return (
            <div
              key={entry.id}
              className="cyber-card flex items-center gap-4 cursor-pointer group"
              onClick={() => handleRerun(entry)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleRerun(entry)}
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-cyber-surface flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-accent/10 transition-colors">
                <Icon size={14} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-mono text-sm font-medium text-cyber-text truncate">
                    {entry.query}
                  </span>
                  {entry.subQuery && (
                    <Badge variant="neutral">{entry.subQuery}</Badge>
                  )}
                  <Badge variant={config.badge}>{config.label}</Badge>
                </div>
                <p className="text-xs font-mono text-cyber-text-dim truncate">
                  {entry.resultSummary}
                </p>
              </div>

              {/* Time + Delete */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="text-xs font-mono text-cyber-text-dim hidden sm:block"
                  title={formatTimestamp(entry.timestamp)}
                >
                  {formatRelativeTime(entry.timestamp)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEntry(entry.id);
                  }}
                  className="text-cyber-muted hover:text-cyber-danger transition-colors p-1 opacity-0 group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;