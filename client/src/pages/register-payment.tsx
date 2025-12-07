import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, AlertCircle, Building2, FileText, Euro, Calendar } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InvoiceWithCompany } from "@shared/schema";

export default function RegisterPayment() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [isRegistered, setIsRegistered] = useState(false);

  const { data: invoice, isLoading, error } = useQuery<InvoiceWithCompany>({
    queryKey: ["/api/invoices", invoiceId],
    enabled: !!invoiceId,
  });

  const registerPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/invoices/${invoiceId}/quick-pay`, {
        paymentDate: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      setIsRegistered(true);
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invoice not found</h2>
            <p className="text-muted-foreground">
              This QR code is no longer valid or the invoice does not exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invoice.status === "paid" || isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-700">
              Payment Registered!
            </h2>
            <p className="text-muted-foreground mb-4">
              Thank you for registering the payment.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{invoice.company.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Invoice {invoice.invoiceNumber || invoice.id.slice(0, 8)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">
                  €{parseFloat(invoice.amount.toString()).toLocaleString("nl-BE", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Register Payment</CardTitle>
          <CardDescription>
            Has this invoice been paid? Register it in 30 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{invoice.company.name}</span>
                </div>
                <Badge
                  variant={invoice.status === "overdue" ? "destructive" : "secondary"}
                  data-testid={`badge-status-${invoice.id}`}
                >
                  {invoice.status === "overdue" ? "Overdue" : "Pending"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice number</p>
                  <p className="font-medium">{invoice.invoiceNumber || invoice.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-mono font-semibold text-lg">
                    €{parseFloat(invoice.amount.toString()).toLocaleString("nl-BE", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Invoice date</p>
                  <p className="font-medium">
                    {format(new Date(invoice.invoiceDate), "d MMM yyyy", { locale: enUS })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due date</p>
                  <p className={`font-medium ${invoice.status === "overdue" ? "text-destructive" : ""}`}>
                    {format(new Date(invoice.dueDate), "d MMM yyyy", { locale: enUS })}
                  </p>
                </div>
              </div>

              {invoice.status === "overdue" && invoice.daysLate && invoice.daysLate > 0 && (
                <div className="mt-3 pt-3 border-t flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{invoice.daysLate} days overdue</span>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => registerPaymentMutation.mutate()}
              disabled={registerPaymentMutation.isPending}
              data-testid="button-register-payment"
            >
              {registerPaymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Yes, this has been paid
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By confirming, the payment will be registered on {format(new Date(), "d MMMM yyyy", { locale: enUS })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
