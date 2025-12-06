import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Flame, FileText, CreditCard, TrendingUp, Sparkles, Star, Zap } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

const fakeLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "user-1",
    userName: "Jan de Boer",
    profileImageUrl: null,
    totalActivity: 156,
    invoicesUploaded: 89,
    paymentsRegistered: 67,
    currentStreak: 12,
    longestStreak: 15,
  },
  {
    rank: 2,
    userId: "user-2",
    userName: "Marie Peeters",
    profileImageUrl: null,
    totalActivity: 134,
    invoicesUploaded: 78,
    paymentsRegistered: 56,
    currentStreak: 8,
    longestStreak: 21,
  },
  {
    rank: 3,
    userId: "user-3",
    userName: "Pieter Janssen",
    profileImageUrl: null,
    totalActivity: 112,
    invoicesUploaded: 65,
    paymentsRegistered: 47,
    currentStreak: 5,
    longestStreak: 9,
  },
  {
    rank: 4,
    userId: "user-4",
    userName: "Sophie Van Dam",
    profileImageUrl: null,
    totalActivity: 98,
    invoicesUploaded: 54,
    paymentsRegistered: 44,
    currentStreak: 3,
    longestStreak: 7,
  },
  {
    rank: 5,
    userId: "user-5",
    userName: "Thomas Bakker",
    profileImageUrl: null,
    totalActivity: 87,
    invoicesUploaded: 49,
    paymentsRegistered: 38,
    currentStreak: 0,
    longestStreak: 11,
  },
  {
    rank: 6,
    userId: "user-6",
    userName: "Anna Vermeer",
    profileImageUrl: null,
    totalActivity: 76,
    invoicesUploaded: 42,
    paymentsRegistered: 34,
    currentStreak: 2,
    longestStreak: 5,
  },
  {
    rank: 7,
    userId: "user-7",
    userName: "Koen Claessens",
    profileImageUrl: null,
    totalActivity: 65,
    invoicesUploaded: 38,
    paymentsRegistered: 27,
    currentStreak: 1,
    longestStreak: 4,
  },
  {
    rank: 8,
    userId: "user-8",
    userName: "Lisa Hermans",
    profileImageUrl: null,
    totalActivity: 54,
    invoicesUploaded: 31,
    paymentsRegistered: 23,
    currentStreak: 0,
    longestStreak: 6,
  },
];

function getRankDecoration(rank: number) {
  switch (rank) {
    case 1:
      return { icon: <Trophy className="h-6 w-6 text-yellow-500" />, emoji: "🥇", bg: "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/40" };
    case 2:
      return { icon: <Medal className="h-5 w-5 text-gray-400" />, emoji: "🥈", bg: "bg-gradient-to-r from-gray-300/20 to-gray-400/10 border-gray-400/40" };
    case 3:
      return { icon: <Medal className="h-5 w-5 text-amber-600" />, emoji: "🥉", bg: "bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/40" };
    default:
      return { icon: <span className="text-sm font-bold text-muted-foreground">#{rank}</span>, emoji: "", bg: "" };
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

function getStreakEmoji(streak: number) {
  if (streak >= 10) return "🔥🔥🔥";
  if (streak >= 5) return "🔥🔥";
  if (streak >= 1) return "🔥";
  return "";
}

function getActivityEmoji(activity: number) {
  if (activity >= 100) return "⭐";
  if (activity >= 50) return "✨";
  return "";
}

export default function Leaderboard() {
  const { data: apiLeaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/gamification/leaderboard"],
  });

  const leaderboard = (apiLeaderboard && apiLeaderboard.length > 0) ? apiLeaderboard : fakeLeaderboard;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
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

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🏆</div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-leaderboard-title">
              Leaderboard
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </h1>
            <p className="text-muted-foreground text-sm">Top bijdragers aan het KMO-Alert netwerk 🚀</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const decoration = getRankDecoration(entry.rank);
            return (
              <Card
                key={entry.userId}
                className={`transition-all hover-elevate ${decoration.bg}`}
                data-testid={`card-leaderboard-${entry.rank}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 flex items-center justify-center text-xl">
                      {decoration.emoji || decoration.icon}
                    </div>
                    
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={entry.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(entry.userName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate flex items-center gap-2" data-testid={`text-leaderboard-name-${entry.rank}`}>
                        {entry.userName}
                        {entry.rank === 1 && <span className="text-sm">👑</span>}
                        {getActivityEmoji(entry.totalActivity)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {entry.invoicesUploaded} facturen 📄
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5" />
                          {entry.paymentsRegistered} betalingen 💳
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.currentStreak > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1 text-orange-500 border-orange-500/30 bg-orange-500/10">
                          <Flame className="h-3 w-3" />
                          {entry.currentStreak} {getStreakEmoji(entry.currentStreak)}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="flex items-center gap-1 font-bold">
                        <Zap className="h-3 w-3 text-primary" />
                        {entry.totalActivity}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="flex-shrink-0 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Hoe verdien je punten? 🎯
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex items-center gap-2">
              <span>📄</span>
              <span>+1 punt per geüploade factuur</span>
            </li>
            <li className="flex items-center gap-2">
              <span>💳</span>
              <span>+1 punt per geregistreerde betaling</span>
            </li>
            <li className="flex items-center gap-2">
              <span>🔥</span>
              <span>Streak bonus: dagelijkse activiteit houdt je streak actief!</span>
            </li>
            <li className="flex items-center gap-2">
              <span>🏆</span>
              <span>Top 3 krijgt een speciale badge!</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
