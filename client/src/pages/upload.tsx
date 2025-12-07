import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import { Link } from "wouter";
import { FileCheck, Clock, Sparkles, Construction, AlertTriangle, Upload } from "lucide-react";
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

export default function UploadPage() {
  const { data: recentInvoices, isLoading } = useQuery<InvoiceWithCompany[]>({
    queryKey: ["/api/invoices", "recent"],
  });

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex-shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2" data-testid="text-page-title">
          <Upload className="h-5 w-5" />
          Upload Invoice
        </h1>
        <p className="text-xs text-muted-foreground">AI extraction of invoice data</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
        <div className="col-span-2 flex flex-col gap-3 min-h-0">
          <Card className="overflow-visible border-2 border-dashed border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 mb-2">
                <Construction className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Upload temporarily disabled
              </h3>
              <p className="text-xs text-muted-foreground">
                Contact us at{" "}
                <a href="mailto:hello@kmo-alert.be" className="text-primary font-medium hover:underline">
                  hello@kmo-alert.be
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible flex-1">
            <CardHeader className="p-3 pb-2 flex-shrink-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mb-2">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <h4 className="text-xs font-medium mb-1">Upload</h4>
                  <p className="text-[10px] text-muted-foreground">Screenshot of invoice</p>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mb-2">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <h4 className="text-xs font-medium mb-1">AI Extraction</h4>
                  <p className="text-[10px] text-muted-foreground">Automatic data reading</p>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mb-2">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <h4 className="text-xs font-medium mb-1">Analysis</h4>
                  <p className="text-[10px] text-muted-foreground">Risk profile & action plan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm">Extracted data</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Invoice date</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Due date</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />VAT number</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Company name</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Invoice amount</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Invoice number</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Payment date</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Status</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-2 flex-shrink-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 overflow-auto min-h-0">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentInvoices && recentInvoices.length > 0 ? (
              <div className="space-y-2">
                {recentInvoices.slice(0, 6).map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/companies/${invoice.companyId}`}
                    className="block rounded border p-2 hover-elevate"
                    data-testid={`link-recent-invoice-${invoice.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <FileCheck className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{invoice.company?.name || "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{formatCurrency(invoice.amount)}</p>
                        </div>
                      </div>
                      <InvoiceStatusBadge
                        status={invoice.status as "pending" | "paid" | "overdue"}
                        daysLate={invoice.daysLate || 0}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FileCheck className="h-6 w-6 text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">No invoices yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
