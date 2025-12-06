import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, TrendingUp, Users, FileText, CreditCard, Loader2 } from "lucide-react";
import type { WeeklyLeaderboard } from "@shared/schema";

export function LeaderboardWidget() {
  const { data: leaderboard, isLoading } = useQuery<WeeklyLeaderboard[]>({
    queryKey: ["/api/engagement/leaderboard"],
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-medium text-muted-foreground w-4 text-center">{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    if (rank === 2) return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    if (rank === 3) return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    return "";
  };

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Weekly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nog geen activiteit deze week</p>
            <p className="text-xs mt-1">Upload facturen om op de leaderboard te komen!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Weekly Leaderboard
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Top {leaderboard.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.companyId}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                index < 3 ? getRankBadgeColor(entry.rank) : "hover:bg-muted/50"
              }`}
              data-testid={`leaderboard-entry-${entry.companyId}`}
            >
              <div className="flex items-center justify-center w-6">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{entry.companyName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {entry.invoicesUploaded}
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {entry.paymentsRegistered}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <Badge variant="secondary" className="font-mono">
                  {entry.totalActivity}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Upload meer facturen om hoger te scoren!</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
