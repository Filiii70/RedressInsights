import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RiskScoreBadge } from "@/components/risk-score-gauge";
import { TrendIndicator } from "@/components/trend-indicator";
import { Link } from "wouter";
import { useState } from "react";
import {
  Euro,
  Clock,
  AlertTriangle,
  FileText,
  ArrowRight,
  Building2,
  Users,
  Receipt,
  Bell,
  Ban,
  Eye,
  CheckCircle,
  TrendingUp,
  Sparkles,
  TrendingDown,
  Minus,
  Gauge,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardStats, InvoiceWithCompany, CompanyWithBehavior, ActivityFeedWithCompany, PortfolioRiskScore } from "@shared/schema";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getActionForDaysLate(daysLate: number): { action: string; color: string } {
  if (daysLate <= 7) {
    return { action: "Herinnering", color: "text-blue-600" };
  } else if (daysLate <= 14) {
    return { action: "Bellen", color: "text-yellow-600" };
  } else if (daysLate <= 30) {
    return { action: "Regeling", color: "text-orange-600" };
  } else if (daysLate <= 60) {
    return { action: "Incasso", color: "text-red-600" };
  } else {
    return { action: "Juridisch", color: "text-red-800" };
  }
}

function ActiesCard({ invoices, isLoading }: { invoices: InvoiceWithCompany[]; isLoading: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const actionGroups = useMemo(() => {
    if (!invoices || invoices.length === 0) return null;
    
    const groups = {
      herinnering: invoices.filter(inv => (inv.daysLate || 0) <= 7),
      bellen: invoices.filter(inv => (inv.daysLate || 0) > 7 && (inv.daysLate || 0) <= 14),
      regeling: invoices.filter(inv => (inv.daysLate || 0) > 14 && (inv.daysLate || 0) <= 30),
      incasso: invoices.filter(inv => (inv.daysLate || 0) > 30 && (inv.daysLate || 0) <= 60),
      juridisch: invoices.filter(inv => (inv.daysLate || 0) > 60),
    };
    
    return groups;
  }, [invoices]);

  const sortedInvoices = useMemo(() => {
    if (!actionGroups) return [];
    const result: InvoiceWithCompany[] = [];
    const maxLen = Math.max(
      actionGroups.herinnering.length,
      actionGroups.bellen.length,
      actionGroups.regeling.length,
      actionGroups.incasso.length,
      actionGroups.juridisch.length
    );
    for (let i = 0; i < maxLen; i++) {
      if (actionGroups.herinnering[i]) result.push(actionGroups.herinnering[i]);
      if (actionGroups.bellen[i]) result.push(actionGroups.bellen[i]);
      if (actionGroups.regeling[i]) result.push(actionGroups.regeling[i]);
      if (actionGroups.incasso[i]) result.push(actionGroups.incasso[i]);
      if (actionGroups.juridisch[i]) result.push(actionGroups.juridisch[i]);
    }
    return result;
  }, [actionGroups]);

  useEffect(() => {
    if (sortedInvoices.length === 0) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sortedInvoices.length);
        setIsAnimating(false);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, [sortedInvoices]);

  const currentInvoice = sortedInvoices[currentIndex];
  const currentAction = currentInvoice ? getActionForDaysLate(currentInvoice.daysLate || 0) : null;

  const actionTypes = [
    { key: 'herinnering', label: 'Herinnering', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', days: '1-7d' },
    { key: 'bellen', label: 'Bellen', bgLight: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', days: '8-14d' },
    { key: 'regeling', label: 'Regeling', bgLight: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', days: '15-30d' },
    { key: 'incasso', label: 'Incasso', bgLight: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', days: '31-60d' },
    { key: 'juridisch', label: 'Juridisch', bgLight: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', days: '60+d' },
  ];

  return (
    <Card className="min-h-0">
      <CardHeader className="p-3 pb-2 flex-shrink-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <span>Aandachtspunten</span>
          <Badge variant="outline" className="text-[10px]">
            {invoices.length} openstaand
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {isLoading ? (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : actionGroups ? (
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2">
              {actionTypes.map((type) => {
                const count = actionGroups[type.key as keyof typeof actionGroups]?.length || 0;
                const items = actionGroups[type.key as keyof typeof actionGroups] || [];
                return (
                  <div 
                    key={type.key} 
                    className={`rounded p-2 ${type.bgLight} border ${type.border} ${count > 0 ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-lg font-bold ${type.text}`}>{count}</span>
                    </div>
                    <p className={`text-[10px] font-medium ${type.text}`}>{type.label}</p>
                    <p className="text-[9px] text-muted-foreground">{type.days}</p>
                    {count > 0 && items[0] && (
                      <Link 
                        href={`/companies/${items[0].companyId}`}
                        className="text-[9px] text-muted-foreground truncate block hover:underline mt-1"
                      >
                        {items[0].company?.name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            
            {currentInvoice && currentAction && (
              <div className="flex items-center gap-2 p-2 rounded bg-muted/50 border">
                <div className="flex-1 min-w-0">
                  <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'}`}>
                    <Link 
                      href={`/companies/${currentInvoice.companyId}`}
                      className="hover:underline"
                    >
                      <span className={`text-xs font-semibold ${currentAction.color}`}>{currentAction.action}</span>
                      <span className="text-xs"> - {currentInvoice.company?.name}</span>
                      <span className="text-xs text-muted-foreground"> - {formatCurrency(currentInvoice.amount)}, {currentInvoice.daysLate}d achterstallig</span>
                    </Link>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{currentIndex + 1}/{sortedInvoices.length}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="h-6 w-6 text-green-500/50 mb-1" />
            <p className="text-xs text-muted-foreground">Geen openstaande acties - alle facturen op schema</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActionTickerBanner({ invoices }: { invoices: InvoiceWithCompany[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sortedInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) return [];
    
    const groups: { [key: string]: InvoiceWithCompany[] } = {
      herinnering: [],
      bellen: [],
      regeling: [],
      incasso: [],
      juridisch: []
    };
    
    invoices.forEach(inv => {
      const days = inv.daysLate || 0;
      if (days <= 7) groups.herinnering.push(inv);
      else if (days <= 14) groups.bellen.push(inv);
      else if (days <= 30) groups.regeling.push(inv);
      else if (days <= 60) groups.incasso.push(inv);
      else groups.juridisch.push(inv);
    });
    
    const result: InvoiceWithCompany[] = [];
    const maxLen = Math.max(...Object.values(groups).map(g => g.length));
    for (let i = 0; i < maxLen; i++) {
      if (groups.herinnering[i]) result.push(groups.herinnering[i]);
      if (groups.bellen[i]) result.push(groups.bellen[i]);
      if (groups.regeling[i]) result.push(groups.regeling[i]);
      if (groups.incasso[i]) result.push(groups.incasso[i]);
      if (groups.juridisch[i]) result.push(groups.juridisch[i]);
    }
    return result;
  }, [invoices]);

  useEffect(() => {
    if (!sortedInvoices || sortedInvoices.length === 0) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sortedInvoices.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [sortedInvoices]);

  if (!invoices || invoices.length === 0) {
    return (
      <div className="h-8 flex-shrink-0 bg-gradient-to-r from-green-500/10 via-primary/5 to-green-500/10 border-t flex items-center overflow-hidden">
        <div className="flex items-center gap-2 px-3 flex-shrink-0 border-r h-full bg-background/50">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span className="text-[10px] font-medium text-green-600">ACTIES</span>
        </div>
        <div className="flex-1 px-3">
          <span className="text-xs text-green-600">Geen openstaande acties - alle facturen op schema</span>
        </div>
      </div>
    );
  }

  const actionSummary = invoices.reduce((acc, inv) => {
    const days = inv.daysLate || 0;
    if (days <= 7) acc.herinnering++;
    else if (days <= 14) acc.bellen++;
    else if (days <= 30) acc.regeling++;
    else if (days <= 60) acc.incasso++;
    else acc.juridisch++;
    return acc;
  }, { herinnering: 0, bellen: 0, regeling: 0, incasso: 0, juridisch: 0 });

  const currentInvoice = sortedInvoices[currentIndex];
  if (!currentInvoice) return null;
  
  const daysLate = currentInvoice.daysLate || 0;
  const { action, color } = getActionForDaysLate(daysLate);

  return (
    <div className="h-8 flex-shrink-0 bg-gradient-to-r from-orange-500/10 via-primary/5 to-orange-500/10 border-t flex items-center overflow-hidden">
      <div className="flex items-center gap-2 px-3 flex-shrink-0 border-r h-full bg-background/50">
        <Bell className="h-3 w-3 text-orange-500 animate-pulse" />
        <span className="text-[10px] font-medium text-orange-600">ACTIES</span>
      </div>
      <div className="flex items-center gap-1 px-2 flex-shrink-0 border-r h-full">
        {actionSummary.herinnering > 0 && (
          <span className="text-[9px] px-1 bg-blue-100 text-blue-700 rounded" title="Herinnering sturen (1-7d)">{actionSummary.herinnering}</span>
        )}
        {actionSummary.bellen > 0 && (
          <span className="text-[9px] px-1 bg-yellow-100 text-yellow-700 rounded" title="Bellen (8-14d)">{actionSummary.bellen}</span>
        )}
        {actionSummary.regeling > 0 && (
          <span className="text-[9px] px-1 bg-orange-100 text-orange-700 rounded" title="Betalingsregeling (15-30d)">{actionSummary.regeling}</span>
        )}
        {actionSummary.incasso > 0 && (
          <span className="text-[9px] px-1 bg-red-100 text-red-700 rounded" title="Incasso (31-60d)">{actionSummary.incasso}</span>
        )}
        {actionSummary.juridisch > 0 && (
          <span className="text-[9px] px-1 bg-red-200 text-red-800 rounded" title="Juridisch (60+d)">{actionSummary.juridisch}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden px-3">
        <div 
          className={`flex items-center gap-2 transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
          }`}
        >
          <Link 
            href={`/companies/${currentInvoice.companyId}`}
            className="text-xs hover:underline cursor-pointer truncate"
            data-testid={`ticker-action-${currentInvoice.id}`}
            title={`${currentInvoice.company?.name}\nBTW: ${currentInvoice.company?.vatNumber || 'Onbekend'}\nFactuur: ${formatCurrency(currentInvoice.amount)}\nVervalt: ${formatDate(currentInvoice.dueDate)}\n${daysLate} dagen achterstallig\n\nActie: ${action}`}
          >
            <strong className={color}>{action}</strong>
            {' '}- <strong>{currentInvoice.company?.name}</strong>
            {' '}- {formatCurrency(currentInvoice.amount)}, {daysLate}d
          </Link>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            ({currentIndex + 1}/{sortedInvoices.length})
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: criticalInvoices, isLoading: invoicesLoading } = useQuery<InvoiceWithCompany[]>({
    queryKey: ["/api/invoices/critical", { limit: 50 }],
    queryFn: async () => {
      const res = await fetch("/api/invoices/critical?limit=50");
      if (!res.ok) throw new Error("Failed to fetch critical invoices");
      return res.json();
    },
  });

  const { data: riskyCompanies, isLoading: companiesLoading } = useQuery<CompanyWithBehavior[]>({
    queryKey: ["/api/companies", "risky"],
  });

  const { data: activityFeed } = useQuery<ActivityFeedWithCompany[]>({
    queryKey: ["/api/activity/network"],
    refetchInterval: 30000,
  });

  const { data: portfolioRisk } = useQuery<PortfolioRiskScore>({
    queryKey: ["/api/gamification/portfolio-risk"],
  });

  const activitySummary = activityFeed ? {
    invoices: activityFeed.filter(a => a.eventType === 'invoice_uploaded').length,
    payments: activityFeed.filter(a => a.eventType === 'payment_registered').length,
    alerts: activityFeed.filter(a => a.eventType === 'risk_alert').length,
  } : { invoices: 0, payments: 0, alerts: 0 };

  const { toast } = useToast();
  const [selectedActivity, setSelectedActivity] = useState<ActivityFeedWithCompany | null>(null);

  const blacklistMutation = useMutation({
    mutationFn: async (data: { companyId: string; reason: string; riskScoreAtTime?: number }) => {
      return apiRequest("POST", "/api/blacklist", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist"] });
      toast({ title: "Toegevoegd", description: "Bedrijf toegevoegd aan zwarte lijst" });
      setSelectedActivity(null);
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon niet toevoegen aan zwarte lijst", variant: "destructive" });
    },
  });

  const getActivityIcon = (eventType: string) => {
    switch (eventType) {
      case 'member_joined': return <Users className="h-3 w-3 text-green-500" />;
      case 'company_added': return <Building2 className="h-3 w-3 text-blue-500" />;
      case 'member_milestone': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'blacklist_added': return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      case 'risk_improvement': return <TrendingUp className="h-3 w-3 text-green-500" />;
      default: return <Bell className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const riskDistributionData = [
    { name: "Laag", value: 35, color: "#22c55e" },
    { name: "Gemiddeld", value: 40, color: "#f59e0b" },
    { name: "Hoog", value: 18, color: "#f97316" },
    { name: "Kritiek", value: 7, color: "#ef4444" },
  ];

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-[10px] text-muted-foreground">Betalingsgedrag register</p>
        </div>
        <div className="flex items-center gap-3">
          {portfolioRisk && (
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card cursor-help"
              data-testid="widget-portfolio-risk"
              title={`Portfolio Risico (0-10): Gewogen gemiddelde risicoscore van alle klanten. Lager is beter. Uitstaand: €${Math.round(portfolioRisk.totalOutstanding).toLocaleString()}`}
            >
              <Gauge className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground">Portfolio Risico</span>
                <div className="flex items-center gap-1">
                  <span 
                    className={`text-sm font-bold ${
                      portfolioRisk.score >= 7 ? 'text-red-500' :
                      portfolioRisk.score >= 4 ? 'text-orange-500' :
                      'text-green-500'
                    }`}
                    data-testid="text-portfolio-score"
                  >
                    {portfolioRisk.score.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">/10</span>
                  {portfolioRisk.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                  {portfolioRisk.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
                  {portfolioRisk.trend === 'stable' && <Minus className="h-3 w-3 text-muted-foreground" />}
                </div>
              </div>
            </div>
          )}
          <Button size="sm" asChild data-testid="button-upload-invoice">
            <Link href="/upload">
              <FileText className="mr-1 h-3 w-3" />
              Uploaden
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Ontvangen</p>
                  <p className="text-sm font-bold text-green-600 truncate">{formatCurrency(stats?.totalPaid || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-3 flex items-center gap-2">
                <Euro className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Te innen</p>
                  <p className="text-sm font-bold text-orange-600 truncate">{formatCurrency(stats?.totalOutstanding || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Achterstallig</p>
                  <p className="text-sm font-bold text-red-600">{stats?.overdueInvoices || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Open facturen</p>
                  <p className="text-sm font-bold">{(stats?.pendingInvoices || 0) + (stats?.overdueInvoices || 0)}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex-1 grid grid-rows-2 gap-2 min-h-0">
        <div className="grid grid-cols-3 gap-2 min-h-0">
          <Card className="col-span-2 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="p-2 pb-1 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xs flex-shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Actieve Opvolging
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-2 flex-shrink-0" asChild>
                  <Link href="/invoices">
                    Alle <ArrowRight className="ml-1 h-2.5 w-2.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 flex-1 min-h-0 overflow-hidden">
              {invoicesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : criticalInvoices && criticalInvoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] py-0.5">Bedrijf</TableHead>
                      <TableHead className="text-[10px] py-0.5">Bedrag</TableHead>
                      <TableHead className="text-[10px] py-0.5">Actie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criticalInvoices.slice(0, 3).map((invoice) => (
                      <TableRow key={invoice.id} className="text-xs" data-testid={`row-invoice-${invoice.id}`}>
                        <TableCell className="py-1 font-medium truncate max-w-[100px]">
                          <Link href={`/companies/${invoice.companyId}`} className="hover:underline">
                            {invoice.company?.name || "Onbekend"}
                          </Link>
                        </TableCell>
                        <TableCell className="py-1 font-mono text-[10px]">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell className="py-1">
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {(invoice.daysLate || 0) > 30 ? "Bellen" : "Herinnering"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <CheckCircle className="h-6 w-6 text-green-500/50 mb-1" />
                  <p className="text-[10px] text-muted-foreground">Alles op schema</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="p-2 pb-0 flex-shrink-0">
              <CardTitle className="text-xs">Klantverdeling</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0 flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius="35%"
                      outerRadius="65%"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-1 flex-shrink-0">
                {riskDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-0.5 text-[9px]">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <ActiesCard invoices={criticalInvoices || []} isLoading={invoicesLoading} />
      </div>

      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedActivity && getActivityIcon(selectedActivity.eventType)}
              Netwerk Update
            </DialogTitle>
            <DialogDescription>Activiteit details</DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Bericht</p>
                <p className="text-sm font-medium">{selectedActivity.message}</p>
              </div>
              
              {selectedActivity.company && (
                <>
                  <div className="p-3 rounded border bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{selectedActivity.company.name}</span>
                      {selectedActivity.company.isCustomer && (
                        <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-500">Klant</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedActivity.company.vatNumber}</p>
                    {selectedActivity.company.sector && (
                      <p className="text-xs text-muted-foreground">Sector: {selectedActivity.company.sector}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/companies/${selectedActivity.company.id}`}>
                      <Button size="sm" variant="outline" data-testid="button-view-company">
                        <Building2 className="h-3 w-3 mr-1" />
                        Bekijk Bedrijf
                      </Button>
                    </Link>
                    
                    {(selectedActivity.eventType === 'risk_alert' || selectedActivity.severity === 'critical') && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => blacklistMutation.mutate({
                          companyId: selectedActivity.company!.id,
                          reason: selectedActivity.message,
                          riskScoreAtTime: 80,
                        })}
                        disabled={blacklistMutation.isPending}
                        data-testid="button-add-blacklist"
                      >
                        <Ban className="h-3 w-3 mr-1" />
                        Zwarte Lijst
                      </Button>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span>Type: {selectedActivity.eventType}</span>
                {selectedActivity.severity && (
                  <Badge 
                    variant={selectedActivity.severity === 'critical' ? 'destructive' : 
                             selectedActivity.severity === 'warning' ? 'secondary' : 'outline'}
                    className="text-[10px]"
                  >
                    {selectedActivity.severity}
                  </Badge>
                )}
                <span>{formatDate(selectedActivity.createdAt || new Date())}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
