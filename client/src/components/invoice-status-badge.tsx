import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface InvoiceStatusBadgeProps {
  status: "pending" | "paid" | "overdue";
  daysLate?: number;
  className?: string;
}

export function InvoiceStatusBadge({ status, daysLate, className }: InvoiceStatusBadgeProps) {
  const config = {
    pending: {
      label: "In afwachting",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      icon: Clock,
    },
    paid: {
      label: "Betaald",
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      icon: CheckCircle,
    },
    overdue: {
      label: daysLate ? `${daysLate}d te laat` : "Te laat",
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
      icon: AlertTriangle,
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        current.bg,
        current.text,
        className
      )}
      data-testid={`badge-invoice-status-${status}`}
    >
      <Icon className="h-3 w-3" />
      <span>{current.label}</span>
    </span>
  );
}
