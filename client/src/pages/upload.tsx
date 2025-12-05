import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import { Link } from "wouter";
import { Building2, FileCheck, Clock, Sparkles, Construction, AlertTriangle } from "lucide-react";
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

export default function Upload() {
  const { data: recentInvoices, isLoading } = useQuery<InvoiceWithCompany[]>({
    queryKey: ["/api/invoices", "recent"],
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
          Factuur uploaden
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload je facturen en laat AI de gegevens automatisch extraheren
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Zone - Temporarily Disabled */}
        <div className="lg:col-span-2">
          <Card className="overflow-visible border-2 border-dashed border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 mb-4">
                <Construction className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Upload tijdelijk uitgeschakeld
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                We werken aan verbeteringen voor de factuur upload functie. 
                Deze functionaliteit is binnenkort weer beschikbaar.
              </p>
              <p className="text-xs text-muted-foreground">
                Neem contact op voor handmatige invoer van factuurgegevens.
              </p>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="mt-6 overflow-visible">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Hoe het werkt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-medium mb-1">Upload</h4>
                  <p className="text-sm text-muted-foreground">
                    Maak een screenshot van je factuur en sleep het naar het upload veld
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                    <span className="text-lg font-bold text-primary">2</span>
                  </div>
                  <h4 className="font-medium mb-1">AI Extractie</h4>
                  <p className="text-sm text-muted-foreground">
                    Onze AI leest automatisch alle relevante gegevens uit
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                    <span className="text-lg font-bold text-primary">3</span>
                  </div>
                  <h4 className="font-medium mb-1">Analyse</h4>
                  <p className="text-sm text-muted-foreground">
                    Krijg direct een risicoprofiel en actieplan voor de klant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Uploads */}
        <div>
          <Card className="overflow-visible">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent geüpload
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentInvoices && recentInvoices.length > 0 ? (
                <div className="space-y-3">
                  {recentInvoices.slice(0, 5).map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/companies/${invoice.companyId}`}
                      className="block rounded-lg border p-3 hover-elevate"
                      data-testid={`link-recent-invoice-${invoice.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {invoice.company?.name || "Onbekend"}
                            </p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {formatCurrency(invoice.amount)}
                            </p>
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
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileCheck className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nog geen facturen geüpload
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted data info */}
          <Card className="mt-6 overflow-visible">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Geëxtraheerde gegevens</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Factuurdatum
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Vervaldatum
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Betaaldatum (indien betaald)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  BTW-nummer klant
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Bedrijfsnaam
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Factuurbedrag
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Factuurnummer
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
