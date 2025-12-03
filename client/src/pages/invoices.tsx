import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
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
import { Search, FileText, Upload, Building2 } from "lucide-react";
import type { InvoiceWithCompany } from "@shared/schema";

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

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: invoices, isLoading } = useQuery<InvoiceWithCompany[]>({
    queryKey: ["/api/invoices"],
  });

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch =
      !search ||
      invoice.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.company?.vatNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices?.length || 0,
    pending: invoices?.filter((i) => i.status === "pending").length || 0,
    overdue: invoices?.filter((i) => i.status === "overdue").length || 0,
    paid: invoices?.filter((i) => i.status === "paid").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Facturen
          </h1>
          <p className="text-muted-foreground mt-1">
            Beheer en bekijk al je geüploade facturen
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
            <div className="text-2xl font-bold" data-testid="stat-total-invoices">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Totaal facturen</p>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-pending-invoices">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">In afwachting</p>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600" data-testid="stat-overdue-invoices">{stats.overdue}</div>
            <p className="text-sm text-muted-foreground">Te laat</p>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600" data-testid="stat-paid-invoices">{stats.paid}</div>
            <p className="text-sm text-muted-foreground">Betaald</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="overflow-visible">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Alle facturen</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Zoek op bedrijf, factuurnummer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                  data-testid="input-search-invoices"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="pending">In afwachting</SelectItem>
                  <SelectItem value="overdue">Te laat</SelectItem>
                  <SelectItem value="paid">Betaald</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bedrijf</TableHead>
                    <TableHead>Factuurnummer</TableHead>
                    <TableHead>Bedrag</TableHead>
                    <TableHead>Factuurdatum</TableHead>
                    <TableHead>Vervaldatum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dagen te laat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell>
                        <Link
                          href={`/companies/${invoice.companyId}`}
                          className="flex items-center gap-2 hover:underline font-medium"
                        >
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {invoice.company?.name || "Onbekend"}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {invoice.invoiceNumber || "-"}
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge
                          status={invoice.status as "pending" | "paid" | "overdue"}
                          daysLate={invoice.daysLate || 0}
                        />
                      </TableCell>
                      <TableCell>
                        {invoice.status === "overdue" ? (
                          <span className="font-mono text-red-600 dark:text-red-400">
                            +{invoice.daysLate || 0}
                          </span>
                        ) : invoice.status === "paid" && invoice.daysLate && invoice.daysLate > 0 ? (
                          <span className="font-mono text-amber-600 dark:text-amber-400">
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Geen facturen gevonden</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all"
                  ? "Probeer andere zoekfilters"
                  : "Upload je eerste factuur om te beginnen"}
              </p>
              {!search && statusFilter === "all" && (
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
