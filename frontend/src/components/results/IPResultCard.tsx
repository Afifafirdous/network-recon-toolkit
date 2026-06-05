import React from "react";
import { Monitor, Copy } from "lucide-react";
import CopyButton from "../ui/CopyButton";
import Badge from "../ui/Badge";
import type { IPResult } from "../../types";

interface IPResultCardProps {
  data: IPResult;
}

const IPResultCard: React.FC<IPResultCardProps> = ({ data }) => {
  return (
    <div className="cyber-card animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-cyber-accent" />
          <span className="cyber-label">IP Address</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge variant="info">IPv{data.ipVersion}</Badge>
          {data.isProxy && <Badge variant="warning" dot>Proxy / VPN</Badge>}
          {data.isHosting && <Badge variant="neutral" dot>Hosting / DC</Badge>}
          {data.isMobile && <Badge variant="info" dot>Mobile</Badge>}
        </div>
      </div>

      {/* IP + Flag */}
      <div className="flex items-center gap-3 mb-3">
        {data.flag && (
          <span className="text-3xl leading-none" role="img" aria-label={data.country || ""}>
            {data.flag}
          </span>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-semibold text-cyber-accent tracking-wider">
              {data.ip}
            </span>
            <CopyButton text={data.ip} />
          </div>
          {data.reverseDns && (
            <p className="font-mono text-xs text-cyber-text-dim mt-0.5">
              ↩ {data.reverseDns}
            </p>
          )}
        </div>
      </div>

      {/* Quick location */}
      {(data.city || data.country) && (
        <p className="text-sm text-cyber-text-dim font-mono">
          {[data.city, data.region, data.country].filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  );
};

export default IPResultCard;