import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="cyber-card border-cyber-danger/30 bg-cyber-danger/5 animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={18}
          className="text-cyber-danger flex-shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono font-medium text-cyber-danger">
            Error
          </p>
          <p className="text-sm font-mono text-cyber-text-dim mt-0.5 break-words">
            {message}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="cyber-btn-ghost text-cyber-danger border-cyber-danger/30 hover:bg-cyber-danger/10 hover:border-cyber-danger flex-shrink-0"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;