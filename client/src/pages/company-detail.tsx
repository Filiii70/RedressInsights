import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskScoreGauge, RiskScoreBadge } from "@/components/risk-score-gauge";
import { TrendIndicator } from "@/components/trend-indicator";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import { ActionPlanPanel } from "@/components/action-plan-panel";
import { StatCard } from "@/components/stat-card";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  ArrowLeft,
  FileText,
  Calendar,
  MapPin,
  Clock,
  Euro,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { CompanyWithBehavior, Invoice, ActionPlan } from "@shared/schema";

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

export default function CompanyDetail() {
  const params = useParams<{ id: string }>();
  const companyId = params.id;

  const { data: company, isLoading: companyLoading } = useQuery<CompanyWithBehavior>({
    queryKey: ["/api/companies", companyId],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/companies", companyId, "invoices"],
  });

  const { data: actionPlan, isLoading: actionPlanLoading } = useQuery<ActionPlan>({
    queryKey: ["/api/companies", companyId, "action-plan"],
  });

  // Mock payment trend data for chart
  const paymentTrendData = [
    { month: "Jun", daysLate: 15 },
    { month: "Jul", daysLate: 22 },
    { month: "Aug", daysLate: 18 },
    { month: "Sep", daysLate: 28 },
    { month: "Okt", daysLate: 35 },
    { month: "Nov", daysLate: 42 },
  ];

  const sectorBenchmark = 14; // Average days late for sector

  if (companyLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-lg font-medium mb-2">Bedrijf niet gevonden</h2>
        <Button asChild variant="outline">
          <Link href="/companies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar overzicht
          </Link>
        </Button>
      </div>
    );
  }

  const riskScore = company.paymentBehavior?.riskScore || 50;
  const avgDaysLate = Math.round(parseFloat(company.paymentBehavior?.avgDaysLate?.toString() || "0"));
  const trend = (company.paymentBehavior?.trend as "improving" | "stable" | "worsening") || "stable";

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/companies" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-company-name">
                {company.name}
              </h1>
              <RiskScoreBadge score={riskScore} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5 font-mono text-sm">
                <Building2 className="h-4 w-4" />
                {company.vatNumber}
              </span>
              {company.sector && (
                <span className="flex items-center gap-1.5 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  {company.sector}
                </span>
              )}
              {company.country && (
                <span className="flex items-center gap-1.5 text-sm">
                  <MapPin className="h-4 w-4" />
                  {company.country}
                </span>
              )}
              {company.foundingDate && (
                <span className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-4 w-4" />
                  Opgericht {company.foundingDate}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Risicoscore"
          value={riskScore}
          icon={
            <div className="h-5 w-5">
              <RiskScoreGauge score={riskScore} size="sm" showLabel={false} />
            </div>
          }
        />
        <StatCard
          title="Gem. dagen te laat"
          value={`${avgDaysLate} dagen`}
          subtitle={`Sector: ${sectorBenchmark} dagen`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Totaal facturen"
          value={company.paymentBehavior?.totalInvoices || 0}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Totaal bedrag"
          value={formatCurrency(company.paymentBehavior?.totalAmount || 0)}
          icon={<Euro className="h-5 w-5" />}
        />
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="history" className="space-y-4">
            <TabsList data-testid="tabs-company-detail">
              <TabsTrigger value="history">Betalingsgeschiedenis</TabsTrigger>
              <TabsTrigger value="analysis">Risico analyse</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card className="overflow-visible">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-lg">Facturen</CardTitle>
                    <TrendIndicator trend={trend} />
                  </div>
                </CardHeader>
                <CardContent>
                  {invoicesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : invoices && invoices.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Factuurnummer</TableHead>
                          <TableHead>Bedrag</TableHead>
                          <TableHead>Vervaldatum</TableHead>
                          <TableHead>Betaaldatum</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Dagen te laat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                            <TableCell className="font-mono">
                              {invoice.invoiceNumber || "-"}
                            </TableCell>
                            <TableCell className="font-mono font-medium">
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                            <TableCell>
                              {invoice.paymentDate ? formatDate(invoice.paymentDate) : "-"}
                            </TableCell>
                            <TableCell>
                              <InvoiceStatusBadge
                                status={invoice.status as "pending" | "paid" | "overdue"}
                                daysLate={invoice.daysLate || 0}
                              />
                            </TableCell>
                            <TableCell>
                              {invoice.daysLate && invoice.daysLate > 0 ? (
                                <span className="font-mono text-red-600 dark:text-red-400">
                                  +{invoice.daysLate}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">Geen facturen gevonden</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <Card className="overflow-visible">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Betalingstrend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={paymentTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="month"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => `${value}d`}
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value} dagen`, "Te laat"]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <ReferenceLine
                          y={sectorBenchmark}
                          stroke="hsl(var(--muted-foreground))"
                          strokeDasharray="5 5"
                          label={{
                            value: `Sector: ${sectorBenchmark}d`,
                            position: "right",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="daysLate"
                          name="Dagen te laat"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Betalingspercentage op tijd
                      </p>
                      <p className="text-2xl font-bold">
                        {Math.round(
                          ((company.paymentBehavior?.paidInvoices || 0) /
                            Math.max(company.paymentBehavior?.totalInvoices || 1, 1)) *
                            100
                        )}%
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        Gemiddelde afwijking sector
                      </p>
                      <p className="text-2xl font-bold">
                        {avgDaysLate > sectorBenchmark ? "+" : ""}
                        {avgDaysLate - sectorBenchmark} dagen
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Plan Sidebar */}
        <div>
          {actionPlanLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : actionPlan ? (
            <ActionPlanPanel plan={actionPlan} companyName={company.name} />
          ) : (
            <Card className="overflow-visible">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  Geen actieplan beschikbaar
                </p>
              </CardContent>
            </Card>
          )}

          {/* Risk Score Large */}
          <Card className="mt-6 overflow-visible">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-center">Risicoscore</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              <RiskScoreGauge score={riskScore} size="lg" />
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Gebaseerd op {company.paymentBehavior?.totalInvoices || 0} facturen
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
