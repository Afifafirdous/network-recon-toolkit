import React from "react";
import { Shield, Wifi } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <header className="border-b border-cyber-border bg-cyber-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield
                className="text-cyber-accent"
                size={22}
                strokeWidth={1.5}
              />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyber-accent rounded-full animate-pulse-slow" />
            </div>
            <div>
              <span className="font-mono font-semibold text-cyber-text text-sm tracking-wide">
                Network<span className="text-cyber-accent">Recon</span>
              </span>
              <span className="ml-1.5 text-cyber-text-dim font-mono text-xs">
                Toolkit
              </span>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-text-dim">
            <Wifi size={12} className="text-cyber-success" />
            <span className="text-cyber-success">ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;