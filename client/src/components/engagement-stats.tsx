import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, FileText, CreditCard, QrCode, Trophy, Loader2 } from "lucide-react";
import type { EngagementStats as EngagementStatsType } from "@shared/schema";

interface EngagementStatsProps {
  companyId: string;
}

export function EngagementStats({ companyId }: EngagementStatsProps) {
  const { data: stats, isLoading } = useQuery<EngagementStatsType>({
    queryKey: ["/api/companies", companyId, "engagement"],
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return "text-green-600";
    if (current < previous) return "text-red-600";
    return "text-muted-foreground";
  };

  const getPercentileMessage = (percentile: number) => {
    if (percentile >= 90) return "Top 10%! Excellent!";
    if (percentile >= 75) return "Better than 75% of peers";
    if (percentile >= 50) return "Better than half";
    if (percentile > 0) return "Stay active to score higher";
    return "Start uploading!";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Your Activity</CardTitle>
          {stats.rank > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              #{stats.rank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-mono">{stats.thisWeek.invoicesUploaded}</p>
            <div className="flex items-center justify-center gap-1 text-xs">
              {getTrendIcon(stats.thisWeek.invoicesUploaded, stats.lastWeek.invoicesUploaded)}
              <span className={getTrendColor(stats.thisWeek.invoicesUploaded, stats.lastWeek.invoicesUploaded)}>
                {stats.lastWeek.invoicesUploaded > 0
                  ? `${Math.round(((stats.thisWeek.invoicesUploaded - stats.lastWeek.invoicesUploaded) / stats.lastWeek.invoicesUploaded) * 100)}%`
                  : "+∞"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Invoices</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CreditCard className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold font-mono">{stats.thisWeek.paymentsRegistered}</p>
            <div className="flex items-center justify-center gap-1 text-xs">
              {getTrendIcon(stats.thisWeek.paymentsRegistered, stats.lastWeek.paymentsRegistered)}
              <span className={getTrendColor(stats.thisWeek.paymentsRegistered, stats.lastWeek.paymentsRegistered)}>
                {stats.lastWeek.paymentsRegistered > 0
                  ? `${Math.round(((stats.thisWeek.paymentsRegistered - stats.lastWeek.paymentsRegistered) / stats.lastWeek.paymentsRegistered) * 100)}%`
                  : stats.thisWeek.paymentsRegistered > 0 ? "+∞" : "0"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Payments</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <QrCode className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono">{stats.thisWeek.qrScans}</p>
            <div className="flex items-center justify-center gap-1 text-xs">
              {getTrendIcon(stats.thisWeek.qrScans, stats.lastWeek.qrScans)}
              <span className={getTrendColor(stats.thisWeek.qrScans, stats.lastWeek.qrScans)}>
                {stats.lastWeek.qrScans > 0
                  ? `${Math.round(((stats.thisWeek.qrScans - stats.lastWeek.qrScans) / stats.lastWeek.qrScans) * 100)}%`
                  : stats.thisWeek.qrScans > 0 ? "+∞" : "0"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">QR Scans</p>
          </div>
        </div>

        {stats.percentile > 0 && (
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-sm font-medium">{getPercentileMessage(stats.percentile)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Network average: {stats.networkAverage.invoicesUploaded} invoices, {stats.networkAverage.paymentsRegistered} payments
            </p>
          </div>
        )}

        {stats.percentile === 0 && (
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">
              Upload invoices and register payments to increase your score
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
