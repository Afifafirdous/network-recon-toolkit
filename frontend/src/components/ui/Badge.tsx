import React from "react";

type Variant = "success" | "danger" | "warning" | "info" | "neutral";

interface BadgeProps {
  variant: Variant;
  children: React.ReactNode;
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ variant, children, dot = false }) => {
  const classMap: Record<Variant, string> = {
    success: "badge-success",
    danger: "badge-danger",
    warning: "badge-warning",
    info: "badge-info",
    neutral: "badge-neutral",
  };

  const dotColorMap: Record<Variant, string> = {
    success: "bg-cyber-success",
    danger: "bg-cyber-danger",
    warning: "bg-cyber-warning",
    info: "bg-cyber-accent",
    neutral: "bg-cyber-muted",
  };

  return (
    <span className={classMap[variant]}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColorMap[variant]}`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;