import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
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
} from "lucide-react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentInvoices, isLoading: invoicesLoading } = useQuery<InvoiceWithCompany[]>({
    queryKey: ["/api/invoices", "recent"],
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

  const cashflowData = [
    { month: "Nov", expected: 45000, atRisk: 8000 },
    { month: "Dec", expected: 52000, atRisk: 12000 },
    { month: "Jan", expected: 38000, atRisk: 5000 },
    { month: "Feb", expected: 41000, atRisk: 9000 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overzicht van je betalingsgedrag register
          </p>
        </div>
        <Button asChild data-testid="button-upload-invoice">
          <Link href="/upload">
            <FileText className="mr-2 h-4 w-4" />
            Factuur uploaden
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-visible">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Openstaand"
              value={formatCurrency(stats?.totalOutstanding || 0)}
              trend="up"
              trendValue="+12%"
              icon={<Euro className="h-5 w-5" />}
            />
            <StatCard
              title="Gem. dagen te laat"
              value={`${Math.round(stats?.avgDaysLate || 0)} dagen`}
              trend="down"
              trendValue="-3 dagen"
              icon={<Clock className="h-5 w-5" />}
            />
            <StatCard
              title="Hoog risico klanten"
              value={stats?.highRiskClients || 0}
              subtitle="Score > 70"
              icon={<AlertTriangle className="h-5 w-5" />}
              valueClassName="text-orange-600 dark:text-orange-400"
            />
            <StatCard
              title="Te late facturen"
              value={stats?.overdueInvoices || 0}
              subtitle={`van ${(stats?.pendingInvoices || 0) + (stats?.overdueInvoices || 0)} openstaand`}
              icon={<FileText className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Invoices */}
        <Card className="lg:col-span-2 overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <CardTitle className="text-lg">Recente facturen</CardTitle>
            <Button variant="ghost" size="sm" asChild data-testid="link-view-all-invoices">
              <Link href="/invoices">
                Bekijk alle
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentInvoices && recentInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bedrijf</TableHead>
                    <TableHead>Bedrag</TableHead>
                    <TableHead>Vervaldatum</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.slice(0, 5).map((invoice) => (
                    <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/companies/${invoice.companyId}`}
                          className="hover:underline"
                        >
                          {invoice.company?.name || "Onbekend"}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge
                          status={invoice.status as "pending" | "paid" | "overdue"}
                          daysLate={invoice.daysLate || 0}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nog geen facturen</p>
                <Button asChild variant="ghost" className="mt-2" data-testid="link-upload-first-invoice">
                  <Link href="/upload">Upload je eerste factuur</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Risicoverdeling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Percentage"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {riskDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                  <span className="font-mono text-muted-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Risky Companies */}
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <CardTitle className="text-lg">Hoogste risico klanten</CardTitle>
            <Button variant="ghost" size="sm" asChild data-testid="link-view-all-companies">
              <Link href="/companies">
                Bekijk alle
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {companiesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : riskyCompanies && riskyCompanies.length > 0 ? (
              <div className="space-y-3">
                {riskyCompanies.slice(0, 4).map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover-elevate"
                    data-testid={`link-company-${company.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {company.vatNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendIndicator
                        trend={(company.paymentBehavior?.trend as "improving" | "stable" | "worsening") || "stable"}
                        showLabel={false}
                      />
                      <RiskScoreBadge score={company.paymentBehavior?.riskScore || 50} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nog geen bedrijven</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cashflow Forecast */}
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Cashflow voorspelling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `€${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="expected"
                    name="Verwacht"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="atRisk"
                    name="Risico"
                    fill="hsl(var(--destructive))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Verwachte inkomsten</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span>Risico</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <LeaderboardWidget />
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Netwerk Groei</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-primary/5">
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Bedrijven</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/5">
                  <p className="text-3xl font-bold text-green-600">230+</p>
                  <p className="text-sm text-muted-foreground">Facturen</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/5">
                  <p className="text-3xl font-bold text-blue-600">€2.1M</p>
                  <p className="text-sm text-muted-foreground">Totaal Volume</p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Hoe meer bedrijven meedoen, hoe betrouwbaarder de data. Nodig collega's uit!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
