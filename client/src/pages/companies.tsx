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
import { Search, Building2, Upload, ArrowRight } from "lucide-react";
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Bedrijven
          </h1>
          <p className="text-muted-foreground mt-1">
            Bekijk betalingsgedrag en risicoprofielen van je klanten
          </p>
        </div>
        <Button asChild data-testid="button-upload-invoice">
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Factuur uploaden
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold" data-testid="stat-total-companies">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Totaal bedrijven</p>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600" data-testid="stat-low-risk">{stats.lowRisk}</div>
            <p className="text-sm text-muted-foreground">Laag risico</p>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600" data-testid="stat-high-risk">{stats.highRisk}</div>
            <p className="text-sm text-muted-foreground">Hoog risico</p>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold" data-testid="stat-avg-days-late">{stats.avgDaysLate} dagen</div>
            <p className="text-sm text-muted-foreground">Gem. dagen te laat</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="overflow-visible">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Alle bedrijven</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Zoek op naam, BTW, sector..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                  data-testid="input-search-companies"
                />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full sm:w-40" data-testid="select-risk-filter">
                  <SelectValue placeholder="Risico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle risico's</SelectItem>
                  <SelectItem value="low">Laag (0-30)</SelectItem>
                  <SelectItem value="medium">Medium (31-60)</SelectItem>
                  <SelectItem value="high">Hoog (61-80)</SelectItem>
                  <SelectItem value="critical">Kritiek (81-100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredCompanies && filteredCompanies.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bedrijf</TableHead>
                    <TableHead>BTW-nummer</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Facturen</TableHead>
                    <TableHead>Gem. dagen te laat</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Risicoscore</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {company.vatNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.sector || "-"}
                      </TableCell>
                      <TableCell className="font-mono">
                        {company.paymentBehavior?.totalInvoices || 0}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {Math.round(parseFloat(company.paymentBehavior?.avgDaysLate?.toString() || "0"))} dagen
                        </span>
                      </TableCell>
                      <TableCell>
                        <TrendIndicator
                          trend={(company.paymentBehavior?.trend as "improving" | "stable" | "worsening") || "stable"}
                        />
                      </TableCell>
                      <TableCell>
                        <RiskScoreBadge score={company.paymentBehavior?.riskScore || 50} />
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Geen bedrijven gevonden</h3>
              <p className="text-muted-foreground mb-4">
                {search || riskFilter !== "all"
                  ? "Probeer andere zoekfilters"
                  : "Upload je eerste factuur om bedrijven toe te voegen"}
              </p>
              {!search && riskFilter === "all" && (
                <Button asChild data-testid="link-upload-first-invoice">
                  <Link href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Factuur uploaden
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
