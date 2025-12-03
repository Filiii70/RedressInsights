import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskScoreBadge } from "@/components/risk-score-gauge";
import { TrendIndicator } from "@/components/trend-indicator";
import { Link } from "wouter";
import { Building2, ArrowRight, AlertTriangle, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { CompanyWithBehavior } from "@shared/schema";

export default function RiskAnalysis() {
  const { data: companies, isLoading } = useQuery<CompanyWithBehavior[]>({
    queryKey: ["/api/companies"],
  });

  // Calculate risk distribution
  const riskDistribution = {
    low: companies?.filter((c) => (c.paymentBehavior?.riskScore || 50) <= 30).length || 0,
    medium: companies?.filter((c) => {
      const score = c.paymentBehavior?.riskScore || 50;
      return score > 30 && score <= 60;
    }).length || 0,
    high: companies?.filter((c) => {
      const score = c.paymentBehavior?.riskScore || 50;
      return score > 60 && score <= 80;
    }).length || 0,
    critical: companies?.filter((c) => (c.paymentBehavior?.riskScore || 50) > 80).length || 0,
  };

  const pieData = [
    { name: "Laag (0-30)", value: riskDistribution.low, color: "#22c55e" },
    { name: "Medium (31-60)", value: riskDistribution.medium, color: "#f59e0b" },
    { name: "Hoog (61-80)", value: riskDistribution.high, color: "#f97316" },
    { name: "Kritiek (81-100)", value: riskDistribution.critical, color: "#ef4444" },
  ];

  // Sector risk comparison (mock data - would come from API)
  const sectorData = [
    { sector: "Bouw", avgRisk: 68 },
    { sector: "Retail", avgRisk: 52 },
    { sector: "IT Services", avgRisk: 35 },
    { sector: "Transport", avgRisk: 61 },
    { sector: "Horeca", avgRisk: 74 },
    { sector: "Industrie", avgRisk: 45 },
  ];

  const highRiskCompanies = companies
    ?.filter((c) => (c.paymentBehavior?.riskScore || 50) > 70)
    .sort((a, b) => (b.paymentBehavior?.riskScore || 0) - (a.paymentBehavior?.riskScore || 0))
    .slice(0, 5);

  const worseningCompanies = companies
    ?.filter((c) => c.paymentBehavior?.trend === "worsening")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
          Risico Analyse
        </h1>
        <p className="text-muted-foreground mt-1">
          Gedetailleerd overzicht van risico's in je klantenportfolio
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-low-risk">
                  {riskDistribution.low}
                </div>
                <p className="text-sm text-muted-foreground">Laag risico</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600" data-testid="stat-medium-risk">
                  {riskDistribution.medium}
                </div>
                <p className="text-sm text-muted-foreground">Medium risico</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600" data-testid="stat-high-risk">
                  {riskDistribution.high}
                </div>
                <p className="text-sm text-muted-foreground">Hoog risico</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600" data-testid="stat-critical-risk">
                  {riskDistribution.critical}
                </div>
                <p className="text-sm text-muted-foreground">Kritiek risico</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Distribution Pie */}
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Risicoverdeling</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value, "Bedrijven"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                      <span className="font-mono text-muted-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sector Comparison */}
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Gemiddeld risico per sector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey="sector"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, "Risicoscore"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="avgRisk"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* High Risk Companies */}
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Hoogste risico klanten
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/companies?risk=high">
                Bekijk alle
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : highRiskCompanies && highRiskCompanies.length > 0 ? (
              <div className="space-y-3">
                {highRiskCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover-elevate"
                    data-testid={`link-high-risk-company-${company.id}`}
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
                    <RiskScoreBadge score={company.paymentBehavior?.riskScore || 50} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="h-10 w-10 text-green-500 mb-3" />
                <p className="text-muted-foreground">Geen hoog risico klanten</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Worsening Trend Companies */}
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500 rotate-180" />
              Verslechterende trends
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/companies">
                Bekijk alle
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : worseningCompanies && worseningCompanies.length > 0 ? (
              <div className="space-y-3">
                {worseningCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover-elevate"
                    data-testid={`link-worsening-company-${company.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(parseFloat(company.paymentBehavior?.avgDaysLate?.toString() || "0"))} dagen te laat
                        </p>
                      </div>
                    </div>
                    <TrendIndicator trend="worsening" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="h-10 w-10 text-green-500 mb-3" />
                <p className="text-muted-foreground">Geen verslechterende trends</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
