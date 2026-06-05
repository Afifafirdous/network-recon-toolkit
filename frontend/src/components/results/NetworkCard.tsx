import React from "react";
import { Network, Building2 } from "lucide-react";
import CopyButton from "../ui/CopyButton";
import type { IPResult } from "../../types";

interface NetworkCardProps {
  data: Pick<IPResult, "isp" | "org" | "asn" | "asnName">;
}

const Row: React.FC<{
  label: string;
  value: string | null | undefined;
  copyable?: boolean;
}> = ({ label, value, copyable = false }) => {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-cyber-border/50 last:border-0 gap-3">
      <span className="cyber-label flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 text-right min-w-0">
        <span className="cyber-value break-all">{value}</span>
        {copyable && <CopyButton text={value} />}
      </div>
    </div>
  );
};

const NetworkCard: React.FC<NetworkCardProps> = ({ data }) => {
  return (
    <div className="cyber-card animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Network size={15} className="text-cyber-accent" />
        <span className="cyber-label">Network</span>
      </div>

      <Row label="ISP" value={data.isp} />
      <Row label="Organization" value={data.org} />
      <Row label="ASN" value={data.asn} copyable />
      <Row label="AS Name" value={data.asnName} />
    </div>
  );
};

export default NetworkCard;