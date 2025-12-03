import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  trend: "improving" | "stable" | "worsening";
  showLabel?: boolean;
  className?: string;
}

export function TrendIndicator({ trend, showLabel = true, className }: TrendIndicatorProps) {
  const config = {
    improving: {
      label: "Verbeterend",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    stable: {
      label: "Stabiel",
      icon: Minus,
      color: "text-muted-foreground",
      bg: "bg-muted/50",
    },
    worsening: {
      label: "Verslechterend",
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
  };

  const current = config[trend];
  const Icon = current.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        current.bg,
        current.color,
        className
      )}
      data-testid={`badge-trend-${trend}`}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span>{current.label}</span>}
    </span>
  );
}
