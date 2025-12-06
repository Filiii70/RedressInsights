import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskScoreBadge } from "@/components/risk-score-gauge";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import { TrendIndicator } from "@/components/trend-indicator";
import { LeaderboardWidget } from "@/components/leaderboard-widget";
import { Link } from "wouter";
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
  Mail,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardStats, InvoiceWithCompany, CompanyWithBehavior } from "@shared/schema";
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

  const riskDistributionData = [
    { name: "Laag", value: 35, color: "#22c55e" },
    { name: "Medium", value: 40, color: "#f59e0b" },
    { name: "Hoog", value: 18, color: "#f97316" },
    { name: "Kritiek", value: 7, color: "#ef4444" },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Betalingsgedrag register</p>
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
                <Euro className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Openstaand</p>
                  <p className="text-sm font-bold truncate">{formatCurrency(stats?.totalOutstanding || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Gem. te laat</p>
                  <p className="text-sm font-bold">{Math.round(stats?.avgDaysLate || 0)}d</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Hoog risico</p>
                  <p className="text-sm font-bold text-orange-600">{stats?.highRiskClients || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Te laat</p>
                  <p className="text-sm font-bold text-red-600">{stats?.overdueInvoices || 0}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content - Two columns */}
      <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
        {/* Left: Invoices Table */}
        <Card className="col-span-2 flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="p-3 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm flex-shrink-0">Kritieke facturen</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-xs flex-shrink-0" asChild>
                <Link href="/invoices">
                  Alle <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 overflow-y-auto">
            {invoicesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : criticalInvoices && criticalInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-1">Bedrijf</TableHead>
                    <TableHead className="text-xs py-1">Bedrag</TableHead>
                    <TableHead className="text-xs py-1">Te laat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criticalInvoices.slice(0, 6).map((invoice) => (
                    <TableRow key={invoice.id} className="text-xs" data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell className="py-1.5 font-medium truncate max-w-[120px]">
                        <Link href={`/companies/${invoice.companyId}`} className="hover:underline">
                          {invoice.company?.name || "Onbekend"}
                        </Link>
                      </TableCell>
                      <TableCell className="py-1.5 font-mono text-xs">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="py-1.5">
                        <span className="text-red-600 font-medium">{invoice.daysLate || 0}d</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">Nog geen facturen</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Risk Chart */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Risicoverdeling</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="70%"
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
            <div className="flex flex-wrap justify-center gap-2 flex-shrink-0">
              {riskDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Compact */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
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

        {/* Weekly Leaderboard */}
        <LeaderboardWidget />
      </div>
    </div>
  );
}
