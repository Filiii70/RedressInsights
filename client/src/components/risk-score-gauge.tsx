import { cn } from "@/lib/utils";

interface RiskScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function RiskScoreGauge({
  score,
  size = "md",
  showLabel = true,
  className,
}: RiskScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  
  const getRiskLevel = (s: number) => {
    if (s <= 30) return { label: "Laag", color: "text-green-600 dark:text-green-400" };
    if (s <= 60) return { label: "Medium", color: "text-amber-600 dark:text-amber-400" };
    if (s <= 80) return { label: "Hoog", color: "text-orange-600 dark:text-orange-400" };
    return { label: "Kritiek", color: "text-red-600 dark:text-red-400" };
  };

  const risk = getRiskLevel(clampedScore);
  
  const getStrokeColor = (s: number) => {
    if (s <= 30) return "stroke-green-500";
    if (s <= 60) return "stroke-amber-500";
    if (s <= 80) return "stroke-orange-500";
    return "stroke-red-500";
  };

  const sizeConfig = {
    sm: { width: 80, strokeWidth: 6, fontSize: "text-xl", labelSize: "text-xs" },
    md: { width: 120, strokeWidth: 8, fontSize: "text-3xl", labelSize: "text-sm" },
    lg: { width: 160, strokeWidth: 10, fontSize: "text-4xl", labelSize: "text-base" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: config.width, height: config.width / 2 + 10 }}>
        <svg
          width={config.width}
          height={config.width / 2 + 10}
          viewBox={`0 0 ${config.width} ${config.width / 2 + 10}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.width / 2} 
                A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-muted/30"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.width / 2} 
                A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            strokeWidth={config.strokeWidth}
            className={cn("transition-all duration-500", getStrokeColor(clampedScore))}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className={cn("font-bold font-mono tabular-nums", config.fontSize, risk.color)} data-testid="text-risk-score">
            {clampedScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("mt-1 font-medium", config.labelSize, risk.color)} data-testid="text-risk-label">
          {risk.label} risico
        </span>
      )}
    </div>
  );
}

export function RiskScoreBadge({ score, className }: { score: number; className?: string }) {
  const getRiskConfig = (s: number) => {
    if (s <= 30) return { label: "Laag", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" };
    if (s <= 60) return { label: "Medium", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" };
    if (s <= 80) return { label: "Hoog", bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" };
    return { label: "Kritiek", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" };
  };

  const config = getRiskConfig(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
      data-testid="badge-risk-score"
    >
      <span className="font-mono tabular-nums">{score}</span>
      <span>{config.label}</span>
    </span>
  );
}
