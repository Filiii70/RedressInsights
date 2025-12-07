import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Activity, FileText, Banknote, AlertTriangle, TrendingUp, Building2, Pin } from "lucide-react";
import type { ActivityFeedWithCompany } from "@shared/schema";

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'invoice_uploaded':
      return <FileText className="h-3.5 w-3.5 text-blue-500" />;
    case 'payment_registered':
      return <Banknote className="h-3.5 w-3.5 text-green-500" />;
    case 'risk_alert':
      return <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />;
    case 'risk_improvement':
      return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
    case 'company_added':
      return <Building2 className="h-3.5 w-3.5 text-blue-500" />;
    default:
      return <Pin className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function LiveTickerHeader() {
  const { data: feed } = useQuery<ActivityFeedWithCompany[]>({
    queryKey: ["/api/activity/feed"],
    refetchInterval: 30000,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!feed || feed.length === 0) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % feed.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [feed]);

  if (!feed || feed.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Activity className="h-3 w-3 animate-pulse" />
        <span className="text-xs">Waiting for activity...</span>
      </div>
    );
  }

  const currentItem = feed[currentIndex];

  return (
    <div className="flex-1 flex items-center gap-3 min-w-0 overflow-hidden">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live</span>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div 
          className={`flex items-center gap-2 transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <span className="flex-shrink-0">{getEventIcon(currentItem.eventType)}</span>
          <span className="text-sm truncate">{currentItem.message}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatTimeAgo(currentItem.createdAt || new Date())}
          </span>
        </div>
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
