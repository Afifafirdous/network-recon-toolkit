import React from "react";
import { NavLink } from "react-router-dom";
import {
  Globe,
  Wifi,
  Search,
  Server,
  Building2,
  History,
} from "lucide-react";

const tabs = [
  { to: "/ip-lookup",     icon: Globe,     label: "IP Lookup",   short: "IP"     },
  { to: "/my-ip",         icon: Wifi,      label: "My IP",       short: "Mine"   },
  { to: "/domain-lookup", icon: Search,    label: "Domain → IP", short: "Domain" },
  { to: "/dns-lookup",    icon: Server,    label: "DNS Lookup",  short: "DNS"    },
  { to: "/asn-lookup",    icon: Building2, label: "ASN Lookup",  short: "ASN"    },
  { to: "/history",       icon: History,   label: "History",     short: "Log"    },
] as const;

const TabBar: React.FC = () => {
  return (
    <nav className="border-b border-cyber-border bg-cyber-surface/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto gap-1 py-1 scrollbar-hide">
          {tabs.map(({ to, icon: Icon, label, short }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs",
                  "whitespace-nowrap transition-all duration-150 flex-shrink-0",
                  isActive
                    ? "bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30"
                    : "text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-card border border-transparent",
                ].join(" ")
              }
            >
              <Icon size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TabBar;