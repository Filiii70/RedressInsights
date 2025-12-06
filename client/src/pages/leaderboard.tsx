import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trophy, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { LeaderboardEntry } from "@shared/schema";

function getRankEmoji(rank: number) {
  switch (rank) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return `${rank}.`;
  }
}

function getRankBg(rank: number) {
  switch (rank) {
    case 1: return "bg-gradient-to-r from-yellow-500/15 to-amber-500/5 border-yellow-500/30";
    case 2: return "bg-gradient-to-r from-gray-300/15 to-gray-400/5 border-gray-400/30";
    case 3: return "bg-gradient-to-r from-amber-600/15 to-orange-500/5 border-amber-600/30";
    default: return "";
  }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/gamification/leaderboard"],
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <div className="flex-1 flex flex-col gap-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1">
      {/* Banner - Beste Betalers */}
      <div className="flex-shrink-0 bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-teal-500/20 rounded px-2 py-1.5 border border-green-500/30">
        <div className="flex items-center justify-center gap-1">
          <span className="text-[12px]">⭐</span>
          <h1 className="text-[12px] font-bold" data-testid="text-leaderboard-title">Top 10 Beste Betalers</h1>
          <span className="text-[12px]">⭐</span>
        </div>
        <p className="text-[9px] text-center text-muted-foreground">Meest betrouwbare bedrijven in het netwerk</p>
      </div>

      {/* Top 10 list - KLIKBAAR naar bedrijfsdetails */}
      <div className="flex-1 flex flex-col gap-0.5 min-h-0 overflow-auto">
        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.slice(0, 10).map((entry) => (
            <Link
              key={entry.companyId}
              href={`/companies/${entry.companyId}`}
              data-testid={`link-leaderboard-${entry.rank}`}
            >
              <Card className={`hover-elevate cursor-pointer ${getRankBg(entry.rank)}`}>
                <CardContent className="p-1.5 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] w-5 text-center flex-shrink-0 font-medium">
                      {getRankEmoji(entry.rank)}
                    </span>
                    
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={entry.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-green-500/10 text-green-600 text-[9px] font-medium">
                        {getInitials(entry.userName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate flex items-center gap-1">
                        {entry.userName}
                        {entry.rank === 1 && <span className="text-[10px]">👑</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 text-[9px] text-muted-foreground">
                      <span title="Facturen betaald">✅ {entry.paymentsRegistered}/{entry.invoicesUploaded}</span>
                      {entry.currentStreak > 0 && (
                        <span title="Gemiddeld dagen op tijd" className="text-green-600">
                          ⏱️ {entry.currentStreak}d
                        </span>
                      )}
                    </div>

                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 h-4 flex-shrink-0 bg-green-500/10 text-green-600 border-green-500/20">
                      <Star className="h-2.5 w-2.5 mr-0.5" />
                      {entry.totalActivity}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Trophy className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs">Nog geen data beschikbaar</p>
            <p className="text-[10px]">Er zijn nog geen bedrijven met voldoende betalingshistoriek</p>
          </div>
        )}
      </div>

      {/* Bottom legend */}
      <div className="flex-shrink-0 bg-muted/50 rounded px-2 py-1">
        <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground">
          <span>✅ betaald/totaal</span>
          <span>⏱️ dagen op tijd</span>
          <span>⭐ betrouwbaarheid</span>
        </div>
      </div>
    </div>
  );
}
