import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { LeaderboardEntry } from "@shared/schema";

const fakeLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: "user-1", userName: "Jan de Boer", profileImageUrl: null, totalActivity: 156, invoicesUploaded: 89, paymentsRegistered: 67, currentStreak: 12, longestStreak: 15 },
  { rank: 2, userId: "user-2", userName: "Marie Peeters", profileImageUrl: null, totalActivity: 134, invoicesUploaded: 78, paymentsRegistered: 56, currentStreak: 8, longestStreak: 21 },
  { rank: 3, userId: "user-3", userName: "Pieter Janssen", profileImageUrl: null, totalActivity: 112, invoicesUploaded: 65, paymentsRegistered: 47, currentStreak: 5, longestStreak: 9 },
  { rank: 4, userId: "user-4", userName: "Sophie Van Dam", profileImageUrl: null, totalActivity: 98, invoicesUploaded: 54, paymentsRegistered: 44, currentStreak: 3, longestStreak: 7 },
  { rank: 5, userId: "user-5", userName: "Thomas Bakker", profileImageUrl: null, totalActivity: 87, invoicesUploaded: 49, paymentsRegistered: 38, currentStreak: 0, longestStreak: 11 },
  { rank: 6, userId: "user-6", userName: "Anna Vermeer", profileImageUrl: null, totalActivity: 76, invoicesUploaded: 42, paymentsRegistered: 34, currentStreak: 2, longestStreak: 5 },
  { rank: 7, userId: "user-7", userName: "Koen Claessens", profileImageUrl: null, totalActivity: 65, invoicesUploaded: 38, paymentsRegistered: 27, currentStreak: 1, longestStreak: 4 },
  { rank: 8, userId: "user-8", userName: "Lisa Hermans", profileImageUrl: null, totalActivity: 54, invoicesUploaded: 31, paymentsRegistered: 23, currentStreak: 0, longestStreak: 6 },
];

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

function getStreakEmoji(streak: number) {
  if (streak >= 10) return "🔥🔥";
  if (streak >= 5) return "🔥";
  return "";
}

export default function Leaderboard() {
  const [showAll, setShowAll] = useState(false);

  const { data: apiLeaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/gamification/leaderboard"],
  });

  const leaderboard = (apiLeaderboard && apiLeaderboard.length > 0) ? apiLeaderboard : fakeLeaderboard;
  const displayedEntries = showAll ? leaderboard : leaderboard.slice(0, 5);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <div className="flex-1 flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1">
      {/* Clean Banner */}
      <div className="flex-shrink-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-orange-500/20 rounded-lg py-1.5 px-3 border border-yellow-500/30">
        <div className="flex items-center justify-center gap-2">
          <span>🏆</span>
          <h1 className="text-sm font-bold" data-testid="text-leaderboard-title">Leaderboard</h1>
          <span>🏆</span>
        </div>
        <p className="text-center text-muted-foreground text-[9px]">Top bijdragers KMO-Alert netwerk</p>
      </div>

      {/* Compact list */}
      <div className="flex-1 flex flex-col gap-1 min-h-0 overflow-auto">
        {displayedEntries.map((entry) => (
          <Card
            key={entry.userId}
            className={`hover-elevate flex-shrink-0 ${getRankBg(entry.rank)}`}
            data-testid={`card-leaderboard-${entry.rank}`}
          >
            <CardContent className="p-1.5 px-2">
              <div className="flex items-center gap-2">
                <span className="text-sm w-5 text-center flex-shrink-0">
                  {getRankEmoji(entry.rank)}
                </span>
                
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={entry.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                    {getInitials(entry.userName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate flex items-center gap-1" data-testid={`text-leaderboard-name-${entry.rank}`}>
                    {entry.userName}
                    {entry.rank === 1 && <span>👑</span>}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    📄{entry.invoicesUploaded} 💳{entry.paymentsRegistered} 🔥{entry.currentStreak}d
                  </p>
                </div>

                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  {entry.totalActivity}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show more/less button */}
      {leaderboard.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-7 text-xs"
          onClick={() => setShowAll(!showAll)}
          data-testid="button-toggle-leaderboard"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Minder
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Meer +{leaderboard.length - 5}
            </>
          )}
        </Button>
      )}

      {/* Bottom legend */}
      <div className="flex-shrink-0 bg-muted/50 rounded px-2 py-1">
        <div className="flex items-center justify-center gap-3 text-[8px] text-muted-foreground">
          <span>📄 facturen</span>
          <span>💳 betalingen</span>
          <span>🔥 streak</span>
          <span>⚡ totaal</span>
        </div>
      </div>
    </div>
  );
}
