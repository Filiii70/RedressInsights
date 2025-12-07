import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskScoreBadge } from "@/components/risk-score-gauge";
import { TrendIndicator } from "@/components/trend-indicator";
import { Link } from "wouter";
import { Building2, ArrowRight, AlertTriangle, Shield, TrendingUp, Target } from "lucide-react";
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

  const riskDistribution = {
    low: companies?.filter((c) => (c.paymentBehavior?.riskScore || 50) <= 30).length || 0,
    medium: companies?.filter((c) => { const score = c.paymentBehavior?.riskScore || 50; return score > 30 && score <= 60; }).length || 0,
    high: companies?.filter((c) => { const score = c.paymentBehavior?.riskScore || 50; return score > 60 && score <= 80; }).length || 0,
    critical: companies?.filter((c) => (c.paymentBehavior?.riskScore || 50) > 80).length || 0,
  };

  const pieData = [
    { name: "Low", value: riskDistribution.low, color: "#22c55e" },
    { name: "Medium", value: riskDistribution.medium, color: "#f59e0b" },
    { name: "High", value: riskDistribution.high, color: "#f97316" },
    { name: "Critical", value: riskDistribution.critical, color: "#ef4444" },
  ];

  const sectorData = [
    { sector: "Construction", avgRisk: 68 },
    { sector: "Retail", avgRisk: 52 },
    { sector: "IT", avgRisk: 35 },
    { sector: "Transport", avgRisk: 61 },
    { sector: "Hospitality", avgRisk: 74 },
  ];

  const highRiskCompanies = companies
    ?.filter((c) => (c.paymentBehavior?.riskScore || 50) > 70)
    .sort((a, b) => (b.paymentBehavior?.riskScore || 0) - (a.paymentBehavior?.riskScore || 0))
    .slice(0, 4);

  const worseningCompanies = companies
    ?.filter((c) => c.paymentBehavior?.trend === "worsening")
    .slice(0, 4);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex-shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2" data-testid="text-page-title">
          <Target className="h-5 w-5" />
          Risk Analysis
        </h1>
        <p className="text-xs text-muted-foreground">Risk overview of your portfolio</p>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Low</p>
              <p className="text-sm font-bold text-green-600" data-testid="stat-low-risk">{riskDistribution.low}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Medium</p>
              <p className="text-sm font-bold text-amber-600" data-testid="stat-medium-risk">{riskDistribution.medium}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">High</p>
              <p className="text-sm font-bold text-orange-600" data-testid="stat-high-risk">{riskDistribution.high}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-sm font-bold text-red-600" data-testid="stat-critical-risk">{riskDistribution.critical}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
            {isLoading ? (
              <Skeleton className="flex-1" />
            ) : (
              <>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius="35%" outerRadius="60%" paddingAngle={2} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 flex-shrink-0 pt-1">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1 text-[10px]">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                      <span className="font-mono text-muted-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Risk by Sector</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis type="category" dataKey="sector" stroke="hsl(var(--muted-foreground))" fontSize={10} width={70} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} />
                <Bar dataKey="avgRisk" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Highest Risk
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-xs" asChild>
              <Link href="/companies?risk=high">
                All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 overflow-auto min-h-0">
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : highRiskCompanies && highRiskCompanies.length > 0 ? (
              <div className="space-y-2">
                {highRiskCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="flex items-center justify-between rounded border p-2 hover-elevate"
                    data-testid={`link-high-risk-company-${company.id}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{company.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{company.vatNumber}</p>
                      </div>
                    </div>
                    <RiskScoreBadge score={company.paymentBehavior?.riskScore || 50} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Shield className="h-6 w-6 text-green-500 mb-1" />
                <p className="text-xs text-muted-foreground">No high risk</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-orange-500 rotate-180" />
              Worsening Trend
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-xs" asChild>
              <Link href="/companies">
                All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 overflow-auto min-h-0">
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : worseningCompanies && worseningCompanies.length > 0 ? (
              <div className="space-y-2">
                {worseningCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="flex items-center justify-between rounded border p-2 hover-elevate"
                    data-testid={`link-worsening-company-${company.id}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{company.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {Math.round(parseFloat(company.paymentBehavior?.avgDaysLate?.toString() || "0"))}d late
                        </p>
                      </div>
                    </div>
                    <TrendIndicator trend="worsening" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <TrendingUp className="h-6 w-6 text-green-500 mb-1" />
                <p className="text-xs text-muted-foreground">No worsening trends</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
