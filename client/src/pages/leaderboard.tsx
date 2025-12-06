import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Flame, Zap } from "lucide-react";
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

function getRankDecoration(rank: number) {
  switch (rank) {
    case 1:
      return { emoji: "🥇", bg: "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/40" };
    case 2:
      return { emoji: "🥈", bg: "bg-gradient-to-r from-gray-300/20 to-gray-400/10 border-gray-400/40" };
    case 3:
      return { emoji: "🥉", bg: "bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/40" };
    default:
      return { emoji: `#${rank}`, bg: "" };
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
  const { data: apiLeaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/gamification/leaderboard"],
  });

  const leaderboard = (apiLeaderboard && apiLeaderboard.length > 0) ? apiLeaderboard : fakeLeaderboard;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-2 p-2">
        <Skeleton className="h-12 w-full" />
        <div className="flex-1 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Banner */}
      <div className="flex-shrink-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-orange-500/20 rounded-lg py-2 px-4 border border-yellow-500/30">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">🏆</span>
          <h1 className="text-lg font-bold" data-testid="text-leaderboard-title">Leaderboard</h1>
          <span className="text-xl">🏆</span>
        </div>
        <p className="text-center text-muted-foreground text-[10px]">Top bijdragers aan het KMO-Alert netwerk 🚀</p>
      </div>

      {/* Leaderboard Grid - 2 columns */}
      <div className="flex-1 grid grid-cols-2 gap-1.5 min-h-0">
        {leaderboard.slice(0, 8).map((entry) => {
          const decoration = getRankDecoration(entry.rank);
          return (
            <Card
              key={entry.userId}
              className={`hover-elevate ${decoration.bg}`}
              data-testid={`card-leaderboard-${entry.rank}`}
            >
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm w-6 text-center flex-shrink-0">
                    {decoration.emoji}
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
                      {entry.rank === 1 && <span className="text-[10px]">👑</span>}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      📄 {entry.invoicesUploaded} · 💳 {entry.paymentsRegistered}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {entry.currentStreak > 0 && (
                      <span className="text-[10px] text-orange-500">
                        {entry.currentStreak}{getStreakEmoji(entry.currentStreak)}
                      </span>
                    )}
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                      <Zap className="h-2.5 w-2.5 mr-0.5" />
                      {entry.totalActivity}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom info bar */}
      <div className="flex-shrink-0 bg-primary/5 rounded-lg px-3 py-1.5 border border-primary/20">
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span>📄 +1 per factuur</span>
          <span>💳 +1 per betaling</span>
          <span>🔥 Streak bonus</span>
          <span>🏆 Top 3 badge</span>
        </div>
      </div>
    </div>
  );
}
