import { useQuery, useMutation } from "@tanstack/react-query";
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

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: criticalInvoices, isLoading: invoicesLoading } = useQuery<InvoiceWithCompany[]>({
    queryKey: ["/api/invoices/critical"],
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

  // Calculate 24h activity summary from feed
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
      toast({ title: "Toegevoegd", description: "Bedrijf is toegevoegd aan de blacklist" });
      setSelectedActivity(null);
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon niet toevoegen aan blacklist", variant: "destructive" });
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
    { name: "Medium", value: 40, color: "#f59e0b" },
    { name: "Hoog", value: 18, color: "#f97316" },
    { name: "Kritiek", value: 7, color: "#ef4444" },
  ];

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Compact Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold" data-testid="text-page-title">📊 Dashboard</h1>
          <p className="text-[10px] text-muted-foreground">Betalingsgedrag register 💰</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Portfolio Risk Score Widget */}
          {portfolioRisk && (
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card cursor-help"
              data-testid="widget-portfolio-risk"
              title={`Portfolio Risico (0-10): Gewogen gemiddelde van risicoscores van al je klanten. Hoe lager, hoe beter! Uitstaand: €${Math.round(portfolioRisk.totalOutstanding).toLocaleString()}`}
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
              Upload
            </Link>
          </Button>
        </div>
      </div>

      {/* Compact Stats Row */}
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
              <CardContent className="p-2 flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground truncate">Ontvangen</p>
                  <p className="text-xs font-bold text-green-600 truncate">{formatCurrency(stats?.totalPaid || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-2 flex items-center gap-2">
                <Euro className="h-3 w-3 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground truncate">Te innen</p>
                  <p className="text-xs font-bold text-orange-600 truncate">{formatCurrency(stats?.totalOutstanding || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 flex items-center gap-2">
                <Clock className="h-3 w-3 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground truncate">Achterstallig</p>
                  <p className="text-xs font-bold text-red-600">{stats?.overdueInvoices || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 flex items-center gap-2">
                <FileText className="h-3 w-3 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground truncate">Open facturen</p>
                  <p className="text-xs font-bold">{stats?.pendingInvoices || 0}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content - Two rows */}
      <div className="flex-1 grid grid-rows-2 gap-2 min-h-0">
        {/* Top Row: Actieve opvolging + Klantverdeling */}
        <div className="grid grid-cols-3 gap-2 min-h-0">
          {/* Actieve opvolging */}
          <Card className="col-span-2 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="p-2 pb-1 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xs flex-shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Actieve opvolging
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
                            {(invoice.daysLate || 0) > 30 ? "Bel" : "Herinner"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <CheckCircle className="h-6 w-6 text-green-500/50 mb-1" />
                  <p className="text-[10px] text-muted-foreground">Alles op schema!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Klantverdeling */}
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

        {/* Bottom Row: Aandachtspunten (full width) */}
        <Card className="min-h-0">
          <CardHeader className="p-3 pb-2 flex-shrink-0">
            <CardTitle className="text-sm flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              Aandachtspunten
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {companiesLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : riskyCompanies && riskyCompanies.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {riskyCompanies.slice(0, 4).map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="flex items-center gap-2 rounded border p-2 hover-elevate"
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{company.name}</p>
                      <div className="flex items-center gap-1">
                        <RiskScoreBadge score={company.paymentBehavior?.riskScore || 50} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <CheckCircle className="h-6 w-6 text-green-500/50 mb-1" />
                <p className="text-xs text-muted-foreground">Geen aandachtspunten</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KMO-Alert Actie Banner - Concrete acties met bedrijfsnamen */}
      <div className="h-8 flex-shrink-0 bg-gradient-to-r from-orange-500/10 via-primary/5 to-orange-500/10 border-t flex items-center overflow-hidden group">
        <div className="flex items-center gap-2 px-3 flex-shrink-0 border-r h-full bg-background/50">
          <Bell className="h-3 w-3 text-orange-500" />
          <span className="text-[10px] font-medium text-orange-600">ACTIES</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll-horizontal group-hover:[animation-play-state:paused] flex gap-8 whitespace-nowrap">
            {/* Show ALL critical invoices with company names - most urgent first */}
            {criticalInvoices && criticalInvoices.length > 0 ? (
              <>
                {criticalInvoices.map((invoice) => (
                  <Link 
                    key={invoice.id} 
                    href={`/companies/${invoice.companyId}`}
                    className="inline-flex items-center gap-2 text-xs hover:underline cursor-help px-2 py-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    data-testid={`ticker-action-${invoice.id}`}
                    title={`${invoice.company?.name}\nBTW: ${invoice.company?.vatNumber || 'Onbekend'}\nFactuur: ${formatCurrency(invoice.amount)}\nVervaldatum: ${formatDate(invoice.dueDate)}\n${invoice.daysLate || 0} dagen te laat\n\nKlik om bedrijf te bekijken`}
                  >
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span>
                      <strong className="text-red-600">Bel {invoice.company?.name?.split(' ').slice(0, 2).join(' ')}</strong>
                      {' '}- {formatCurrency(invoice.amount)}, {invoice.daysLate || 0}d te laat
                    </span>
                  </Link>
                ))}
                {/* Duplicate first few for seamless loop */}
                {criticalInvoices.slice(0, 5).map((invoice) => (
                  <Link 
                    key={`dup-${invoice.id}`} 
                    href={`/companies/${invoice.companyId}`}
                    className="inline-flex items-center gap-2 text-xs hover:underline cursor-help px-2 py-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title={`${invoice.company?.name}\nBTW: ${invoice.company?.vatNumber || 'Onbekend'}\nFactuur: ${formatCurrency(invoice.amount)}\nVervaldatum: ${formatDate(invoice.dueDate)}\n${invoice.daysLate || 0} dagen te laat\n\nKlik om bedrijf te bekijken`}
                  >
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span>
                      <strong className="text-red-600">Bel {invoice.company?.name?.split(' ').slice(0, 2).join(' ')}</strong>
                      {' '}- {formatCurrency(invoice.amount)}, {invoice.daysLate || 0}d te laat
                    </span>
                  </Link>
                ))}
              </>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs text-green-600 cursor-help" data-testid="ticker-no-actions" title="Geen achterstallige facturen. Alle klanten betalen op tijd!">
                <CheckCircle className="h-3 w-3" />
                <span><strong>Geen openstaande acties</strong> - alle facturen op schema</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Activity Detail Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedActivity && getActivityIcon(selectedActivity.eventType)}
              Netwerk Update
            </DialogTitle>
            <DialogDescription>Details van deze activiteit</DialogDescription>
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
                        Blacklist
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
