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
import type { DashboardStats, InvoiceWithCompany, CompanyWithBehavior, ActivityFeedWithCompany } from "@shared/schema";
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
    queryKey: ["/api/activity/feed"],
    refetchInterval: 30000,
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

  const getActivityEmoji = (eventType: string) => {
    switch (eventType) {
      case 'invoice_uploaded': return '📄';
      case 'payment_registered': return '💰';
      case 'risk_alert': return '⚠️';
      case 'risk_improvement': return '📈';
      case 'company_added': return '🏢';
      default: return '📌';
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
          <h1 className="text-lg font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-[10px] text-muted-foreground">Betalingsgedrag register</p>
        </div>
        <Button size="sm" asChild data-testid="button-upload-invoice">
          <Link href="/upload">
            <FileText className="mr-1 h-3 w-3" />
            Upload
          </Link>
        </Button>
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
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Op tijd betaald</p>
                  <p className="text-sm font-bold text-green-600">{stats?.onTimePayments || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Betrouwbaar</p>
                  <p className="text-sm font-bold text-primary">{stats?.reliableClients || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <Euro className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Ontvangen</p>
                  <p className="text-sm font-bold truncate">{formatCurrency(stats?.paidThisMonth || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Verbeterd</p>
                  <p className="text-sm font-bold text-green-600">{stats?.improvedClients || 0}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content - Two rows */}
      <div className="flex-1 grid grid-rows-2 gap-2 min-h-0">
        {/* Top Row: Kritieke facturen + Risicoverdeling */}
        <div className="grid grid-cols-3 gap-2 min-h-0">
          {/* Kritieke facturen */}
          <Card className="col-span-2 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="p-2 pb-1 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xs flex-shrink-0">Kritieke facturen</CardTitle>
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
                      <TableHead className="text-[10px] py-0.5">Te laat</TableHead>
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
                          <span className="text-red-600 font-medium text-[10px]">{invoice.daysLate || 0}d</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText className="h-6 w-6 text-muted-foreground/50 mb-1" />
                  <p className="text-[10px] text-muted-foreground">Nog geen facturen</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risicoverdeling */}
          <Card className="flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="p-2 pb-0 flex-shrink-0">
              <CardTitle className="text-xs">Risicoverdeling</CardTitle>
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

        {/* Bottom Row: Risico bedrijven + Netwerk Updates */}
        <div className="grid grid-cols-3 gap-2 min-h-0">
        {/* Risky Companies */}
        <Card className="col-span-2">
          <CardHeader className="p-3 pb-2 flex-shrink-0">
            <CardTitle className="text-sm">Risico bedrijven</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {companiesLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : riskyCompanies && riskyCompanies.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {riskyCompanies.slice(0, 3).map((company) => (
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
              <p className="text-xs text-muted-foreground text-center py-4">Geen data</p>
            )}
          </CardContent>
        </Card>

        {/* Network Stats & Live Feed */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Netwerk Updates
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center mb-2">
              <div>
                <Users className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-sm font-bold">{riskyCompanies?.length || 0}+</p>
                <p className="text-[10px] text-muted-foreground">Bedrijven</p>
              </div>
              <div>
                <Receipt className="h-4 w-4 mx-auto text-green-600 mb-1" />
                <p className="text-sm font-bold">{(stats?.overdueInvoices || 0) + (stats?.pendingInvoices || 0)}+</p>
                <p className="text-[10px] text-muted-foreground">Facturen</p>
              </div>
              <div>
                <Bell className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                <p className="text-sm font-bold">{stats?.highRiskClients || 0}</p>
                <p className="text-[10px] text-muted-foreground">Alerts</p>
              </div>
            </div>
            {activityFeed && activityFeed.length > 0 && (
              <div className="pt-2 border-t space-y-1">
                <p className="text-[10px] text-muted-foreground">Recente activiteit (klik voor details):</p>
                {activityFeed.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className="flex items-center gap-2 text-xs p-1.5 rounded cursor-pointer hover-elevate border"
                    data-testid={`activity-item-${activity.id}`}
                  >
                    <span>{getActivityEmoji(activity.eventType)}</span>
                    <span className="truncate flex-1">{activity.message}</span>
                    <Eye className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Activity Detail Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedActivity && getActivityEmoji(selectedActivity.eventType)}
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
