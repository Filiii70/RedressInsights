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
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2" data-testid="text-page-title">
            <FileText className="h-5 w-5" />
            Facturen
          </h1>
          <p className="text-xs text-muted-foreground">Beheer al uw facturen</p>
        </div>
        <Button size="sm" asChild data-testid="button-upload-invoice">
          <Link href="/upload">
            <Upload className="mr-1 h-3 w-3" />
            Uploaden
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Totaal</p>
              <p className="text-sm font-bold" data-testid="stat-total-invoices">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Openstaand</p>
              <p className="text-sm font-bold text-blue-600" data-testid="stat-pending-invoices">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Achterstallig</p>
              <p className="text-sm font-bold text-red-600" data-testid="stat-overdue-invoices">{stats.overdue}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Betaald</p>
              <p className="text-sm font-bold text-green-600" data-testid="stat-paid-invoices">{stats.paid}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-visible flex-1 flex flex-col min-h-0">
        <CardHeader className="p-3 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Alle facturen</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Zoeken..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-7 h-8 w-40 text-xs"
                  data-testid="input-search-invoices"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="pending">Openstaand</SelectItem>
                  <SelectItem value="overdue">Achterstallig</SelectItem>
                  <SelectItem value="paid">Betaald</SelectItem>
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
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs py-1">Bedrijf</TableHead>
                  <TableHead className="text-xs py-1">Nr.</TableHead>
                  <TableHead className="text-xs py-1">Bedrag</TableHead>
                  <TableHead className="text-xs py-1">Vervalt</TableHead>
                  <TableHead className="text-xs py-1">Status</TableHead>
                  <TableHead className="text-xs py-1">+dagen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="text-xs" data-testid={`row-invoice-${invoice.id}`}>
                    <TableCell className="py-1.5">
                      <Link
                        href={`/companies/${invoice.companyId}`}
                        className="flex items-center gap-1 hover:underline font-medium truncate max-w-[120px]"
                      >
                        <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        {invoice.company?.name || "Onbekend"}
                      </Link>
                    </TableCell>
                    <TableCell className="py-1.5 font-mono text-xs truncate max-w-[80px]">
                      {invoice.invoiceNumber || "-"}
                    </TableCell>
                    <TableCell className="py-1.5 font-mono">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className="py-1.5">{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="py-1.5">
                      <InvoiceStatusBadge
                        status={invoice.status as "pending" | "paid" | "overdue"}
                        daysLate={invoice.daysLate || 0}
                      />
                    </TableCell>
                    <TableCell className="py-1.5">
                      {invoice.status === "overdue" ? (
                        <span className="font-mono text-red-600">+{invoice.daysLate || 0}</span>
                      ) : invoice.status === "paid" && invoice.daysLate && invoice.daysLate > 0 ? (
                        <span className="font-mono text-amber-600">+{invoice.daysLate}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                {search || statusFilter !== "all" ? "Geen resultaten" : "Nog geen facturen"}
              </p>
              {!search && statusFilter === "all" && (
                <Button size="sm" className="mt-2" asChild data-testid="link-upload-first-invoice">
                  <Link href="/upload">Uploaden</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
