import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Building2, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import type { CompanyWithBehavior } from "@shared/schema";

function RiskBadge({ score }: { score: number }) {
  if (score <= 30) {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Low</Badge>;
  }
  if (score <= 60) {
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Medium</Badge>;
  }
  if (score <= 80) {
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">High</Badge>;
  }
  return <Badge variant="destructive">Critical</Badge>;
}

function TrendBadge({ trend }: { trend: string }) {
  if (trend === "improving") {
    return <span className="text-green-600 text-xs">Improving</span>;
  }
  if (trend === "worsening") {
    return <span className="text-red-600 text-xs">Worsening</span>;
  }
  return <span className="text-muted-foreground text-xs">Stable</span>;
}

export default function Companies() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const { data: companies, isLoading } = useQuery<CompanyWithBehavior[]>({
    queryKey: ["/api/companies"],
  });

  const filteredCompanies = companies?.filter((company) => {
    const matchesSearch =
      !search ||
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.vatNumber.toLowerCase().includes(search.toLowerCase());

    const riskScore = company.paymentBehavior?.riskScore || 50;
    let matchesRisk = true;
    if (riskFilter === "low") matchesRisk = riskScore <= 30;
    else if (riskFilter === "medium") matchesRisk = riskScore > 30 && riskScore <= 60;
    else if (riskFilter === "high") matchesRisk = riskScore > 60;

    return matchesSearch && matchesRisk;
  });

  const stats = {
    total: companies?.length || 0,
    lowRisk: companies?.filter((c) => (c.paymentBehavior?.riskScore || 50) <= 30).length || 0,
    highRisk: companies?.filter((c) => (c.paymentBehavior?.riskScore || 50) > 70).length || 0,
    avgDaysLate: Math.round(
      (companies?.reduce((acc, c) => acc + parseFloat(c.paymentBehavior?.avgDaysLate?.toString() || "0"), 0) || 0) /
        (companies?.length || 1)
    ),
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2" data-testid="text-page-title">
          <Building2 className="h-5 w-5" />
          Companies
        </h1>
        <p className="text-sm text-muted-foreground">Payment behavior overview</p>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold" data-testid="stat-total-companies">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Low Risk</p>
              <p className="text-lg font-bold text-green-600" data-testid="stat-low-risk">{stats.lowRisk}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">High Risk</p>
              <p className="text-lg font-bold text-red-600" data-testid="stat-high-risk">{stats.highRisk}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="text-muted-foreground font-mono text-sm">Avg</div>
            <div>
              <p className="text-xs text-muted-foreground">Days Late</p>
              <p className="text-lg font-bold" data-testid="stat-avg-days-late">{stats.avgDaysLate}d</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-companies"
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-32" data-testid="select-risk-filter">
            <SelectValue placeholder="Risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 min-h-0 overflow-hidden">
        <CardContent className="p-0 h-full overflow-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredCompanies && filteredCompanies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>VAT Number</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Avg. Days</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{company.vatNumber}</TableCell>
                    <TableCell>{company.paymentBehavior?.totalInvoices || 0}</TableCell>
                    <TableCell>
                      {Math.round(parseFloat(company.paymentBehavior?.avgDaysLate?.toString() || "0"))}d
                    </TableCell>
                    <TableCell>
                      <TrendBadge trend={company.paymentBehavior?.trend || "stable"} />
                    </TableCell>
                    <TableCell>
                      <RiskBadge score={company.paymentBehavior?.riskScore || 50} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/companies/${company.id}`} data-testid={`link-company-detail-${company.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No companies found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
