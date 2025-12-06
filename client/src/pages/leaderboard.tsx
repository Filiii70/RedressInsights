import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";
import { Link } from "wouter";
import type { LeaderboardEntry } from "@shared/schema";

const fakeLeaderboard: LeaderboardEntry[] = [
  { rank: 1, odl: "user-1", userName: "De Boer & Zonen BV", profileImageUrl: null, totalActivity: 156, invoicesUploaded: 89, paymentsRegistered: 67, currentStreak: 12, longestStreak: 15, companyId: "1" },
  { rank: 2, userId: "user-2", userName: "Peeters Transport", profileImageUrl: null, totalActivity: 134, invoicesUploaded: 78, paymentsRegistered: 56, currentStreak: 8, longestStreak: 21, companyId: "2" },
  { rank: 3, userId: "user-3", userName: "Janssen Bouw NV", profileImageUrl: null, totalActivity: 112, invoicesUploaded: 65, paymentsRegistered: 47, currentStreak: 5, longestStreak: 9, companyId: "3" },
  { rank: 4, userId: "user-4", userName: "Van Dam Retail", profileImageUrl: null, totalActivity: 98, invoicesUploaded: 54, paymentsRegistered: 44, currentStreak: 3, longestStreak: 7, companyId: "4" },
  { rank: 5, userId: "user-5", userName: "Bakker IT Solutions", profileImageUrl: null, totalActivity: 87, invoicesUploaded: 49, paymentsRegistered: 38, currentStreak: 0, longestStreak: 11, companyId: "5" },
  { rank: 6, userId: "user-6", userName: "Vermeer Consultancy", profileImageUrl: null, totalActivity: 76, invoicesUploaded: 42, paymentsRegistered: 34, currentStreak: 2, longestStreak: 5, companyId: "6" },
  { rank: 7, userId: "user-7", userName: "Claessens & Co", profileImageUrl: null, totalActivity: 65, invoicesUploaded: 38, paymentsRegistered: 27, currentStreak: 1, longestStreak: 4, companyId: "7" },
  { rank: 8, userId: "user-8", userName: "Hermans Logistics", profileImageUrl: null, totalActivity: 54, invoicesUploaded: 31, paymentsRegistered: 23, currentStreak: 0, longestStreak: 6, companyId: "8" },
  { rank: 9, userId: "user-9", userName: "Willems Trading", profileImageUrl: null, totalActivity: 48, invoicesUploaded: 28, paymentsRegistered: 20, currentStreak: 4, longestStreak: 8, companyId: "9" },
  { rank: 10, userId: "user-10", userName: "Maes Industries", profileImageUrl: null, totalActivity: 42, invoicesUploaded: 25, paymentsRegistered: 17, currentStreak: 0, longestStreak: 3, companyId: "10" },
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

export default function Leaderboard() {
  const { data: apiLeaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/gamification/leaderboard"],
  });

  const leaderboard = (apiLeaderboard && apiLeaderboard.length > 0) ? apiLeaderboard : fakeLeaderboard;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-1">
        <Skeleton className="h-8 w-full" />
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
      {/* Clean Banner */}
      <div className="flex-shrink-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-orange-500/20 rounded px-2 py-1 border border-yellow-500/30">
        <div className="flex items-center justify-center gap-1">
          <span className="text-[10px]">🏆</span>
          <h1 className="text-[11px] font-bold" data-testid="text-leaderboard-title">Top 10 Bijdragers</h1>
          <span className="text-[10px]">🏆</span>
        </div>
      </div>

      {/* Top 10 list - clickable */}
      <div className="flex-1 flex flex-col gap-0.5 min-h-0 overflow-auto">
        {leaderboard.slice(0, 10).map((entry) => {
          const companyId = (entry as any).companyId || entry.userId;
          return (
            <Link
              key={entry.userId || entry.rank}
              href={`/companies/${companyId}`}
              data-testid={`link-leaderboard-${entry.rank}`}
            >
              <Card className={`hover-elevate cursor-pointer ${getRankBg(entry.rank)}`}>
                <CardContent className="p-1 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] w-4 text-center flex-shrink-0">
                      {getRankEmoji(entry.rank)}
                    </span>
                    
                    <Avatar className="h-5 w-5 flex-shrink-0">
                      <AvatarImage src={entry.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-medium">
                        {getInitials(entry.userName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium truncate flex items-center gap-0.5">
                        {entry.userName}
                        {entry.rank === 1 && <span className="text-[9px]">👑</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 text-[9px] text-muted-foreground">
                      <span>📄{entry.invoicesUploaded}</span>
                      <span>💳{entry.paymentsRegistered}</span>
                      {entry.currentStreak > 0 && <span>🔥{entry.currentStreak}</span>}
                    </div>

                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 flex-shrink-0">
                      <Zap className="h-2 w-2 mr-0.5" />
                      {entry.totalActivity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Bottom legend */}
      <div className="flex-shrink-0 bg-muted/50 rounded px-2 py-0.5">
        <div className="flex items-center justify-center gap-2 text-[8px] text-muted-foreground">
          <span>📄 facturen</span>
          <span>💳 betalingen</span>
          <span>🔥 streak</span>
          <span>⚡ score</span>
        </div>
      </div>
    </div>
  );
}
