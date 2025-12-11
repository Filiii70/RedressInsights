import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  Euro,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CompanyWithBehavior, Invoice } from "@shared/schema";

function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-BE", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status, daysLate }: { status: string; daysLate?: number }) {
  if (status === "paid") {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>;
  }
  if (status === "overdue") {
    return <Badge variant="destructive">{daysLate ? `${daysLate}d late` : "Overdue"}</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
}

function RiskBadge({ score }: { score: number }) {
  if (score <= 30) {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Low Risk</Badge>;
  }
  if (score <= 60) {
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Medium Risk</Badge>;
  }
  if (score <= 80) {
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">High Risk</Badge>;
  }
  return <Badge variant="destructive">Critical</Badge>;
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

  const paymentTrendData = [
    { month: "Jun", daysLate: 15 },
    { month: "Jul", daysLate: 22 },
    { month: "Aug", daysLate: 18 },
    { month: "Sep", daysLate: 28 },
    { month: "Oct", daysLate: 35 },
    { month: "Nov", daysLate: 42 },
  ];

  if (companyLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-lg font-medium mb-2">Company not found</h2>
        <Button asChild variant="outline">
          <Link href="/companies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to companies
          </Link>
        </Button>
      </div>
    );
  }

  const riskScore = company.paymentBehavior?.riskScore || 50;
  const avgDaysLate = Math.round(parseFloat(company.paymentBehavior?.avgDaysLate?.toString() || "0"));
  const trend = company.paymentBehavior?.trend || "stable";

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-4 flex-shrink-0">
        <Button variant="outline" size="icon" asChild>
          <Link href="/companies" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" data-testid="text-company-name">{company.name}</h1>
            <RiskBadge score={riskScore} />
          </div>
          <p className="text-sm text-muted-foreground font-mono">{company.vatNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Risk Score</p>
            <p className="text-2xl font-bold">{riskScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg. Days Late</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{avgDaysLate}</p>
              {trend === "worsening" && <TrendingUp className="h-4 w-4 text-red-500" />}
              {trend === "improving" && <TrendingDown className="h-4 w-4 text-green-500" />}
              {trend === "stable" && <Minus className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold">{company.paymentBehavior?.totalInvoices || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">{formatCurrency(company.paymentBehavior?.totalAmount || 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-auto">
            {invoicesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : invoices && invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Invoice #</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Due Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell className="font-mono text-sm">{invoice.invoiceNumber || "-"}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} daysLate={invoice.daysLate || undefined} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Payment Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paymentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}d`} />
                <Tooltip
                  formatter={(value: number) => [`${value} days`, "Late"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="daysLate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
