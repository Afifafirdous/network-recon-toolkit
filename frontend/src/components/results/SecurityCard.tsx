import React from "react";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import Badge from "../ui/Badge";
import type { IPResult } from "../../types";

interface SecurityCardProps {
  data: Pick<IPResult, "isProxy" | "isHosting" | "isMobile">;
}

const SecurityCard: React.FC<SecurityCardProps> = ({ data }) => {
  const allClear = !data.isProxy && !data.isHosting;

  return (
    <div className="cyber-card animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        {allClear ? (
          <ShieldCheck size={15} className="text-cyber-success" />
        ) : (
          <ShieldAlert size={15} className="text-cyber-warning" />
        )}
        <span className="cyber-label">Security Assessment</span>
      </div>

      <div className="space-y-3">
        {/* Proxy / VPN */}
        <div className="flex items-center justify-between py-2 border-b border-cyber-border/50">
          <div>
            <p className="text-sm font-mono text-cyber-text">VPN / Proxy</p>
            <p className="text-xs text-cyber-text-dim mt-0.5">
              Traffic anonymization detected
            </p>
          </div>
          {data.isProxy === null ? (
            <Badge variant="neutral">Unknown</Badge>
          ) : data.isProxy ? (
            <Badge variant="warning" dot>Detected</Badge>
          ) : (
            <Badge variant="success" dot>Clear</Badge>
          )}
        </div>

        {/* Hosting / Datacenter */}
        <div className="flex items-center justify-between py-2 border-b border-cyber-border/50">
          <div>
            <p className="text-sm font-mono text-cyber-text">Hosting / DC</p>
            <p className="text-xs text-cyber-text-dim mt-0.5">
              Datacenter or cloud IP
            </p>
          </div>
          {data.isHosting === null ? (
            <Badge variant="neutral">Unknown</Badge>
          ) : data.isHosting ? (
            <Badge variant="warning" dot>Detected</Badge>
          ) : (
            <Badge variant="success" dot>Clear</Badge>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-mono text-cyber-text">Mobile Network</p>
            <p className="text-xs text-cyber-text-dim mt-0.5">
              Cellular / mobile carrier
            </p>
          </div>
          {data.isMobile === null ? (
            <Badge variant="neutral">Unknown</Badge>
          ) : data.isMobile ? (
            <Badge variant="info" dot>Yes</Badge>
          ) : (
            <Badge variant="neutral">No</Badge>
          )}
        </div>
      </div>

      {/* Summary */}
      {allClear && (
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyber-success bg-cyber-success/5 border border-cyber-success/20 rounded-lg px-3 py-2">
          <ShieldCheck size={12} />
          No threats detected — appears to be a residential or business IP
        </div>
      )}
      {data.isProxy && (
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-cyber-warning bg-cyber-warning/5 border border-cyber-warning/20 rounded-lg px-3 py-2">
          <ShieldX size={12} />
          Anonymization layer detected — treat with caution
        </div>
      )}
    </div>
  );
};

export default SecurityCard;