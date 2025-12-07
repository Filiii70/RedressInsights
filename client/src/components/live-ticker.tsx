import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Link } from "wouter";
import type { ActivityFeedWithCompany } from "@shared/schema";

function getEventEmoji(eventType: string) {
  switch (eventType) {
    case 'invoice_uploaded':
      return '📄';
    case 'payment_registered':
      return '💰';
    case 'risk_alert':
      return '⚠️';
    case 'risk_improvement':
      return '📈';
    case 'company_added':
      return '🏢';
    default:
      return '📌';
  }
}

function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'nu';
  if (diffMins < 60) return `${diffMins}m geleden`;
  if (diffHours < 24) return `${diffHours}u geleden`;
  return `${Math.floor(diffHours / 24)}d geleden`;
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
        <span className="text-xs">Wachten op activiteit...</span>
      </div>
    );
  }

  const currentItem = feed[currentIndex];

  const companyLink = currentItem.companyId ? `/companies/${currentItem.companyId}` : null;

  return (
    <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Live</span>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div 
          className={`flex items-center gap-1.5 transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
          }`}
        >
          <span className="text-xs flex-shrink-0">{getEventEmoji(currentItem.eventType)}</span>
          {companyLink ? (
            <Link 
              href={companyLink}
              className="text-xs truncate hover:underline cursor-pointer hover:text-primary transition-colors"
              title={`${currentItem.message}\n\n${currentItem.company?.name || ''}\n${currentItem.company?.vatNumber || ''}\n\nKlik om bedrijf te bekijken`}
              data-testid="link-live-ticker-item"
            >
              {currentItem.message}
            </Link>
          ) : (
            <span className="text-xs truncate" title={currentItem.message}>{currentItem.message}</span>
          )}
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
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
