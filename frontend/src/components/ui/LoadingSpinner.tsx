import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Querying…",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
      {/* Scanner animation */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-cyber-border flex items-center justify-center">
          <Loader2 size={24} className="text-cyber-accent animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full border border-cyber-accent/20 animate-ping" />
      </div>

      <div className="text-center">
        <p className="font-mono text-sm text-cyber-accent animate-scan">
          {message}
        </p>
        <p className="font-mono text-xs text-cyber-text-dim mt-1">
          Fetching data from external APIs…
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;