import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, FileUp, CreditCard, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { ActivityFeedWithCompany } from "@shared/schema";

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'invoice_uploaded':
      return FileUp;
    case 'payment_registered':
      return CreditCard;
    case 'risk_alert':
      return AlertTriangle;
    case 'risk_improvement':
      return TrendingUp;
    case 'company_added':
      return Activity;
    default:
      return Activity;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'warning':
      return 'text-orange-500';
    case 'critical':
      return 'text-red-500';
    case 'success':
      return 'text-green-500';
    default:
      return 'text-muted-foreground';
  }
}

function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'nu';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}u`;
  return `${Math.floor(diffHours / 24)}d`;
}

export function LiveTicker() {
  const { data: feed } = useQuery<ActivityFeedWithCompany[]>({
    queryKey: ["/api/activity/feed"],
    refetchInterval: 30000,
  });

  if (!feed || feed.length === 0) {
    return (
      <div className="h-8 bg-muted/30 rounded flex items-center px-3 gap-2">
        <Activity className="h-3 w-3 text-muted-foreground animate-pulse" />
        <span className="text-xs text-muted-foreground">Wachten op activiteit...</span>
      </div>
    );
  }

  return (
    <div className="h-8 bg-muted/30 rounded flex items-center overflow-hidden">
      <div className="flex items-center gap-2 px-3 flex-shrink-0 border-r border-muted">
        <Activity className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Live</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={feed[0]?.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 px-3"
          >
            {(() => {
              const Icon = getEventIcon(feed[0]?.eventType || 'activity');
              return <Icon className={`h-3 w-3 flex-shrink-0 ${getSeverityColor(feed[0]?.severity || 'info')}`} />;
            })()}
            <span className="text-xs truncate">{feed[0]?.message}</span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-auto">
              {formatTimeAgo(feed[0]?.createdAt || new Date())}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-1 px-3 flex-shrink-0 border-l border-muted">
        {feed.slice(0, 3).map((item, i) => {
          const Icon = getEventIcon(item.eventType);
          return (
            <div 
              key={item.id}
              className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`}
              title={item.message}
            />
          );
        })}
      </div>
    </div>
  );
}

export function LiveTickerCompact() {
  const { data: newCount } = useQuery<{ count: number }>({
    queryKey: ["/api/activity/new-count"],
    refetchInterval: 60000,
  });

  if (!newCount || newCount.count === 0) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
      <Activity className="h-3 w-3" />
      <span className="font-medium">{newCount.count}</span>
    </div>
  );
}
