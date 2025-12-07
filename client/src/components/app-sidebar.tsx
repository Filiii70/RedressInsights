import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Upload,
  TrendingUp,
  Shield,
  Settings,
  LogIn,
  Activity,
  Mail,
  Ban,
  Trophy,
  Flame,
  Info,
  Search,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import type { UserStreakInfo } from "@shared/schema";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const mainMenuItems = [
  {
    title: "VAT Check",
    url: "/btw-check",
    icon: Search,
    highlight: true,
  },
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: FileText,
  },
  {
    title: "Companies",
    url: "/companies",
    icon: Building2,
  },
  {
    title: "Upload",
    url: "/upload",
    icon: Upload,
  },
];

const analyticsItems = [
  {
    title: "Risk Analysis",
    url: "/risk-analysis",
    icon: Shield,
  },
  {
    title: "Trends",
    url: "/trends",
    icon: TrendingUp,
  },
  {
    title: "Blacklist",
    url: "/blacklist",
    icon: Ban,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Trophy,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  const { data: activityCount } = useQuery<{ count: number }>({
    queryKey: ["/api/activity/new-count"],
    refetchInterval: 60000,
  });

  const { data: streakInfo } = useQuery<UserStreakInfo>({
    queryKey: ["/api/gamification/streak"],
    refetchInterval: 300000, // 5 minutes
    retry: false,
  });

  const newActivityCount = activityCount?.count || 0;
  const currentStreak = streakInfo?.currentStreak || 0;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-3 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight" data-testid="text-brand-name">
                KMO-Alert
              </span>
            </div>
          </Link>
          {currentStreak > 0 && (
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500"
              data-testid="badge-streak"
              title={`${currentStreak} day streak!`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{currentStreak}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-sidebar-border">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <SiWhatsapp className="h-3 w-3 text-green-500" />
          <span className="text-[9px] text-muted-foreground">Email & WhatsApp alerts</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-none">
        <SidebarGroup className="p-1.5">
          <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground h-6 px-1.5">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className={`data-[active=true]:bg-sidebar-accent h-7 ${
                      'highlight' in item && item.highlight ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : ''
                    }`}
                  >
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className={`h-3 w-3 ${'highlight' in item && item.highlight ? 'text-primary-foreground' : ''}`} />
                      <span className="text-xs">{item.title}</span>
                      {item.title === "Dashboard" && newActivityCount > 0 && (
                        <span className="ml-auto flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-medium">
                          <Activity className="h-2 w-2" />
                          {newActivityCount > 99 ? '99+' : newActivityCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-1.5">
          <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground h-6 px-1.5">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="data-[active=true]:bg-sidebar-accent h-7"
                  >
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="h-3 w-3" />
                      <span className="text-xs">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location === "/about"}
              className="data-[active=true]:bg-destructive/20 h-7 bg-destructive/10 border border-destructive/30"
            >
              <Link href="/about" data-testid="link-nav-about">
                <Info className="h-3 w-3 text-destructive" />
                <span className="text-xs font-medium text-destructive">About KMO-Alert</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton data-testid="button-nav-login" className="h-7">
              <LogIn className="h-3 w-3" />
              <span className="text-xs">Login</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location === "/settings"}
              className="data-[active=true]:bg-sidebar-accent h-7"
            >
              <Link href="/settings" data-testid="link-nav-settings">
                <Settings className="h-3 w-3" />
                <span className="text-xs">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <a 
          href="mailto:hello@kmo-alert.be" 
          className="text-[9px] text-center mt-2 block text-primary hover:underline"
          data-testid="link-contact-email"
        >
          hello@kmo-alert.be
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
