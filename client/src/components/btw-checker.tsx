import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { CompanyWithBehavior } from "@shared/schema";

function normalizeVatNumber(input: string): string {
  return input.replace(/[\s.-]/g, "").toUpperCase();
}

function getRiskLevel(score: number): { label: string; color: string; icon: typeof CheckCircle; advice: string } {
  if (score <= 25) return { 
    label: "Excellent", 
    color: "bg-green-500", 
    icon: CheckCircle,
    advice: "This company pays consistently on time. Standard payment terms are safe."
  };
  if (score <= 50) return { 
    label: "Good", 
    color: "bg-emerald-500", 
    icon: CheckCircle,
    advice: "Reliable payer. Normal invoice terms are acceptable."
  };
  if (score <= 70) return { 
    label: "Moderate", 
    color: "bg-yellow-500", 
    icon: AlertTriangle,
    advice: "Some delays possible. Consider shorter payment terms or partial payments."
  };
  if (score <= 85) return { 
    label: "Risky", 
    color: "bg-orange-500", 
    icon: AlertTriangle,
    advice: "High risk of late payment. Request deposit or payment on delivery."
  };
  return { 
    label: "Critical", 
    color: "bg-red-500", 
    icon: XCircle,
    advice: "Very high risk! Only accept prepayment or extend no credit."
  };
}

type LookupResponse = {
  found: boolean;
  company?: CompanyWithBehavior;
  source?: string;
  message?: string;
  vatNumber?: string;
};

export function BTWChecker() {
  const [searchInput, setSearchInput] = useState("");
  const [searchVat, setSearchVat] = useState<string | null>(null);

  const { data: response, isLoading, error } = useQuery<LookupResponse>({
    queryKey: ["/api/companies/lookup", searchVat],
    queryFn: async () => {
      const res = await fetch(`/api/companies/lookup/${searchVat}`);
      if (!res.ok) throw new Error("Failed to lookup company");
      return res.json();
    },
    enabled: !!searchVat,
  });

  const result = response?.found ? response.company : null;

  const handleSearch = () => {
    const normalized = normalizeVatNumber(searchInput);
    if (normalized.length >= 8) {
      setSearchVat(normalized);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const riskScore = result?.paymentBehavior?.riskScore ?? null;
  const riskInfo = riskScore !== null ? getRiskLevel(riskScore) : null;
  const RiskIcon = riskInfo?.icon || Shield;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold">VAT Number Check</h2>
            <p className="text-[10px] text-muted-foreground">Verify payment reliability before invoicing</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="BE0123456789 or NL123456789B01"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm h-9"
            data-testid="input-btw-search"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || searchInput.length < 8}
            className="h-9 px-4"
            data-testid="button-btw-search"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Results */}
        {searchVat && !isLoading && (
          <div className="space-y-2">
            {result ? (
              <>
                {/* Company Found */}
                <div className="flex items-center justify-between p-2 rounded bg-background border">
                  <div className="min-w-0 flex-1">
                    <Link href={`/companies/${result.id}`}>
                      <p className="text-sm font-medium truncate hover:text-primary cursor-pointer" data-testid="text-btw-company-name">
                        {result.name}
                      </p>
                    </Link>
                    <p className="text-[10px] text-muted-foreground">{result.vatNumber} • {result.sector}</p>
                  </div>
                  {riskInfo && (
                    <Badge className={`${riskInfo.color} text-white text-[10px] ml-2`} data-testid="badge-btw-risk">
                      <RiskIcon className="h-3 w-3 mr-1" />
                      {riskScore}% - {riskInfo.label}
                    </Badge>
                  )}
                </div>

                {/* Advice */}
                {riskInfo && (
                  <div className={`p-2 rounded text-[11px] ${
                    riskScore! <= 50 ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                    riskScore! <= 70 ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-500/10 text-red-700 dark:text-red-400'
                  }`} data-testid="text-btw-advice">
                    <strong>Advice:</strong> {riskInfo.advice}
                  </div>
                )}

                {/* Stats */}
                {result.paymentBehavior && (
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-1.5 rounded bg-muted/50">
                      <div className="font-bold">{result.paymentBehavior.totalInvoices}</div>
                      <div className="text-muted-foreground">Invoices</div>
                    </div>
                    <div className="p-1.5 rounded bg-muted/50">
                      <div className="font-bold">{result.paymentBehavior.paidInvoices}</div>
                      <div className="text-muted-foreground">Paid</div>
                    </div>
                    <div className="p-1.5 rounded bg-muted/50">
                      <div className="font-bold">{parseFloat(result.paymentBehavior.avgDaysLate || '0').toFixed(0)}d</div>
                      <div className="text-muted-foreground">Avg. late</div>
                    </div>
                  </div>
                )}

                <Link href={`/companies/${result.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs h-7 mt-1" data-testid="button-btw-details">
                    View full analysis
                  </Button>
                </Link>
              </>
            ) : (
              /* Company Not Found */
              <div className="text-center p-3 bg-muted/50 rounded">
                <XCircle className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">Company not found</p>
                <p className="text-[10px] text-muted-foreground">
                  VAT number "{searchVat}" is not in our network.
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Upload invoices to add this company.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state hint */}
        {!searchVat && (
          <p className="text-[10px] text-center text-muted-foreground">
            Enter a Belgian (BE) or Dutch (NL) VAT number to check payment reliability
          </p>
        )}
      </CardContent>
    </Card>
  );
}
