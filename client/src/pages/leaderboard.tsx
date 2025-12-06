import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Flame, FileText, CreditCard, TrendingUp } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/gamification/leaderboard"],
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">Top bijdragers aan het KMO-Alert netwerk</p>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasData = leaderboard && leaderboard.length > 0;

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-leaderboard-title">Leaderboard</h1>
            <p className="text-muted-foreground text-sm">Top bijdragers aan het KMO-Alert netwerk</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {hasData ? (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <Card
                key={entry.userId}
                className={`transition-all ${entry.rank <= 3 ? 'border-primary/30 bg-primary/5' : ''}`}
                data-testid={`card-leaderboard-${entry.rank}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.profileImageUrl || undefined} />
                      <AvatarFallback>{getInitials(entry.userName)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" data-testid={`text-leaderboard-name-${entry.rank}`}>
                        {entry.userName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {entry.invoicesUploaded} facturen
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5" />
                          {entry.paymentsRegistered} betalingen
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.currentStreak > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1 text-orange-500 border-orange-500/30">
                          <Flame className="h-3 w-3" />
                          {entry.currentStreak}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {entry.totalActivity}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Nog geen activiteit geregistreerd. Upload facturen of registreer betalingen om punten te verdienen!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="flex-shrink-0">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Hoe werkt het?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>+1 punt per geüploade factuur</span>
            </li>
            <li className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <span>+1 punt per geregistreerde betaling</span>
            </li>
            <li className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>Streak bonus: dagelijkse activiteit houdt je streak actief</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
