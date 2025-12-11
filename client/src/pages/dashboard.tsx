import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Euro,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Building2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardStats, InvoiceWithCompany } from "@shared/schema";

function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-BE", {
    day: "2-digit",
    month: "short",
  });
}

interface EarlyAlert {
  id: string;
  companyId: string;
  companyName: string;
  previousAvg: number;
  currentDays: number;
  change: number;
  severity: "warning" | "critical";
}

function generateEarlyAlerts(invoices: InvoiceWithCompany[]): EarlyAlert[] {
  const companyData: { [key: string]: { name: string; days: number[] } } = {};
  
  invoices.forEach(inv => {
    if (!inv.companyId || !inv.company) return;
    if (!companyData[inv.companyId]) {
      companyData[inv.companyId] = { name: inv.company.name, days: [] };
    }
    if (inv.daysLate !== null && inv.daysLate !== undefined) {
      companyData[inv.companyId].days.push(inv.daysLate);
    }
  });

  const alerts: EarlyAlert[] = [];
  
  Object.entries(companyData).forEach(([companyId, data]) => {
    if (data.days.length < 2) return;
    
    const previousDays = data.days.slice(0, -1);
    const previousAvg = previousDays.reduce((a, b) => a + b, 0) / previousDays.length;
    const currentDays = data.days[data.days.length - 1];
    const change = currentDays - previousAvg;
    
    if (change > 10) {
      alerts.push({
        id: companyId,
        companyId,
        companyName: data.name,
        previousAvg: Math.round(previousAvg),
        currentDays,
        change: Math.round(change),
        severity: change > 20 ? "critical" : "warning",
      });
    }
  });

  return alerts.sort((a, b) => b.change - a.change).slice(0, 5);
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<InvoiceWithCompany[]>({
    queryKey: ["/api/invoices"],
  });

  const earlyAlerts = invoices ? generateEarlyAlerts(invoices) : [];
  const overdueInvoices = invoices?.filter(inv => inv.status === "overdue").slice(0, 5) || [];

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Payment behavior monitoring</p>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Received</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(stats?.totalPaid || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Euro className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(stats?.totalOutstanding || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className="text-lg font-bold text-red-600">{stats?.overdueInvoices || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Alerts</p>
                  <p className="text-lg font-bold">{earlyAlerts.length}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <Card className="flex flex-col min-h-0">
          <CardHeader className="p-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Early Alerts
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Pattern changes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-1 min-h-0 overflow-auto">
            {invoicesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : earlyAlerts.length > 0 ? (
              <div className="space-y-2">
                {earlyAlerts.map((alert) => (
                  <Link 
                    key={alert.id} 
                    href={`/companies/${alert.companyId}`}
                    className="block"
                  >
                    <div 
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        alert.severity === "critical" ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50"
                      }`}
                      data-testid={`alert-${alert.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{alert.companyName}</span>
                        <Badge 
                          variant={alert.severity === "critical" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          +{alert.change}d
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Avg: {alert.previousAvg}d</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className={alert.severity === "critical" ? "text-red-600 font-medium" : "text-amber-600 font-medium"}>
                          Now: {alert.currentDays}d
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-500/50 mb-2" />
                <p className="text-sm text-muted-foreground">No pattern changes detected</p>
                <p className="text-xs text-muted-foreground mt-1">All companies paying as expected</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0">
          <CardHeader className="p-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                Overdue Invoices
              </CardTitle>
              <Link href="/invoices" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-1 min-h-0 overflow-auto">
            {invoicesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : overdueInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Company</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueInvoices.map((invoice) => (
                    <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell className="py-2">
                        <Link 
                          href={`/companies/${invoice.companyId}`} 
                          className="text-sm font-medium hover:underline flex items-center gap-1"
                        >
                          <Building2 className="h-3 w-3" />
                          {invoice.company?.name || "Unknown"}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2 font-mono text-sm">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="destructive" className="text-xs">
                          {invoice.daysLate}d
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-500/50 mb-2" />
                <p className="text-sm text-muted-foreground">No overdue invoices</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
