import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskScoreBadge } from "@/components/risk-score-gauge";
import { TrendIndicator } from "@/components/trend-indicator";
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
import { Search, Building2, Upload, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import type { CompanyWithBehavior } from "@shared/schema";

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
      company.vatNumber.toLowerCase().includes(search.toLowerCase()) ||
      company.sector?.toLowerCase().includes(search.toLowerCase());

    const riskScore = company.paymentBehavior?.riskScore || 50;
    let matchesRisk = true;
    if (riskFilter === "low") matchesRisk = riskScore <= 30;
    else if (riskFilter === "medium") matchesRisk = riskScore > 30 && riskScore <= 60;
    else if (riskFilter === "high") matchesRisk = riskScore > 60 && riskScore <= 80;
    else if (riskFilter === "critical") matchesRisk = riskScore > 80;

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
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold" data-testid="text-page-title">🏢 Bedrijven</h1>
          <p className="text-xs text-muted-foreground">Risicoprofielen van je klanten 📊</p>
        </div>
        <Button size="sm" asChild data-testid="button-upload-invoice">
          <Link href="/upload">
            <Upload className="mr-1 h-3 w-3" />
            Upload
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Totaal</p>
              <p className="text-sm font-bold" data-testid="stat-total-companies">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Laag risico</p>
              <p className="text-sm font-bold text-green-600" data-testid="stat-low-risk">{stats.lowRisk}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Hoog risico</p>
              <p className="text-sm font-bold text-red-600" data-testid="stat-high-risk">{stats.highRisk}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="h-4 w-4 text-muted-foreground flex-shrink-0 font-mono text-xs">Ø</div>
            <div>
              <p className="text-xs text-muted-foreground">Gem. te laat</p>
              <p className="text-sm font-bold" data-testid="stat-avg-days-late">{stats.avgDaysLate}d</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-visible flex-1 flex flex-col min-h-0">
        <CardHeader className="p-3 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Alle bedrijven</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Zoek..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-7 h-8 w-40 text-xs"
                  data-testid="input-search-companies"
                />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-risk-filter">
                  <SelectValue placeholder="Risico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="low">Laag</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">Hoog</SelectItem>
                  <SelectItem value="critical">Kritiek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 flex-1 overflow-auto min-h-0">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : filteredCompanies && filteredCompanies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs py-1">Bedrijf</TableHead>
                  <TableHead className="text-xs py-1">BTW</TableHead>
                  <TableHead className="text-xs py-1">Sector</TableHead>
                  <TableHead className="text-xs py-1">Fact.</TableHead>
                  <TableHead className="text-xs py-1">+dagen</TableHead>
                  <TableHead className="text-xs py-1">Trend</TableHead>
                  <TableHead className="text-xs py-1">Risico</TableHead>
                  <TableHead className="text-xs py-1 w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} className="text-xs" data-testid={`row-company-${company.id}`}>
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate max-w-[100px]">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 font-mono text-[10px] truncate max-w-[80px]">
                      {company.vatNumber}
                    </TableCell>
                    <TableCell className="py-1.5 text-muted-foreground truncate max-w-[60px]">
                      {company.sector || "-"}
                    </TableCell>
                    <TableCell className="py-1.5 font-mono">
                      {company.paymentBehavior?.totalInvoices || 0}
                    </TableCell>
                    <TableCell className="py-1.5 font-mono">
                      {Math.round(parseFloat(company.paymentBehavior?.avgDaysLate?.toString() || "0"))}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <TrendIndicator
                        trend={(company.paymentBehavior?.trend as "improving" | "stable" | "worsening") || "stable"}
                      />
                    </TableCell>
                    <TableCell className="py-1.5">
                      <RiskScoreBadge score={company.paymentBehavior?.riskScore || 50} />
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                        <Link href={`/companies/${company.id}`} data-testid={`link-company-detail-${company.id}`}>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Building2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                {search || riskFilter !== "all" ? "Geen resultaten" : "Nog geen bedrijven"}
              </p>
              {!search && riskFilter === "all" && (
                <Button size="sm" className="mt-2" asChild data-testid="link-upload-first-invoice">
                  <Link href="/upload">Upload factuur</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
