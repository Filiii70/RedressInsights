import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Building2, TrendingUp, TrendingDown, Minus, FileText, Euro, Clock } from "lucide-react";
import { Link } from "wouter";
import type { CompanyWithBehavior } from "@shared/schema";

function normalizeVatNumber(input: string): string {
  return input.replace(/[\s.-]/g, "").toUpperCase();
}

function getRiskLevel(score: number): { label: string; color: string; bgColor: string; icon: typeof CheckCircle; advice: string } {
  if (score <= 25) return { 
    label: "Uitstekend", 
    color: "text-green-600", 
    bgColor: "bg-green-500",
    icon: CheckCircle,
    advice: "Dit bedrijf betaalt consequent op tijd. Standaard betalingstermijnen zijn veilig."
  };
  if (score <= 50) return { 
    label: "Goed", 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-500",
    icon: CheckCircle,
    advice: "Betrouwbare betaler. Normale factuurvoorwaarden zijn aanvaardbaar."
  };
  if (score <= 70) return { 
    label: "Matig", 
    color: "text-yellow-600", 
    bgColor: "bg-yellow-500",
    icon: AlertTriangle,
    advice: "Enige vertragingen mogelijk. Overweeg kortere betalingstermijnen of deelbetalingen."
  };
  if (score <= 85) return { 
    label: "Risicovol", 
    color: "text-orange-600", 
    bgColor: "bg-orange-500",
    icon: AlertTriangle,
    advice: "Hoog risico op late betaling. Vraag voorschot of betaling bij levering."
  };
  return { 
    label: "Kritiek", 
    color: "text-red-600", 
    bgColor: "bg-red-500",
    icon: XCircle,
    advice: "Zeer hoog risico! Accepteer alleen vooruitbetaling of verleen geen krediet."
  };
}

function getTrendIcon(trend: string | null | undefined) {
  switch (trend) {
    case 'improving': return <TrendingUp className="h-3 w-3 text-green-500" />;
    case 'worsening': return <TrendingDown className="h-3 w-3 text-red-500" />;
    default: return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
}

type LookupResponse = {
  found: boolean;
  company?: CompanyWithBehavior;
  source?: string;
  message?: string;
};

export default function BTWCheck() {
  const [searchInput, setSearchInput] = useState("");
  const [searchVat, setSearchVat] = useState<string | null>(null);

  const { data: response, isLoading, isFetched, refetch } = useQuery<LookupResponse>({
    queryKey: ["/api/companies/lookup", searchVat],
    queryFn: async () => {
      const res = await fetch(`/api/companies/lookup/${searchVat}?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to lookup company");
      return res.json();
    },
    enabled: !!searchVat,
    staleTime: 0,
    gcTime: 0,
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
    <div className="h-full flex flex-col gap-4">
      <div className="flex-shrink-0 text-center">
        <h1 className="text-base font-bold flex items-center justify-center gap-1.5">
          <Search className="h-4 w-4 text-primary" />
          BTW Nummer Check
        </h1>
        <p className="text-xs text-muted-foreground">
          Controleer betalingsgedrag van Benelux bedrijven
        </p>
      </div>

      <Card className="flex-shrink-0 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-4">
          <div className="max-w-lg mx-auto">
            <label className="text-xs font-medium mb-1.5 block">Voer BTW nummer in</label>
            <div className="flex gap-2">
              <Input
                placeholder="BE0123456789, NL123456789B01 of LU12345678"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-sm h-9"
                data-testid="input-btw-search-main"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading || searchInput.length < 8}
                className="h-9 px-4"
                data-testid="button-btw-search-main"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-1" />
                    Zoeken
                  </>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              BE (België), NL (Nederland) en LU (Luxemburg) BTW nummers
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 min-h-0 overflow-auto">
        {searchVat && isFetched && (
          <div className="max-w-2xl mx-auto">
            {result ? (
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="truncate" data-testid="text-company-name">{result.name}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>{result.vatNumber}</span>
                        <span>•</span>
                        <span>{result.sector}</span>
                        <span>•</span>
                        <span>{result.country}</span>
                      </div>
                    </div>
                    {riskInfo && (
                      <Badge className={`${riskInfo.bgColor} text-white text-xs px-2 py-0.5`} data-testid="badge-risk-score">
                        <RiskIcon className="h-3 w-3 mr-1" />
                        {riskScore}% - {riskInfo.label}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {riskInfo && (
                    <div className={`p-3 rounded-lg border ${
                      riskScore! <= 50 ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                      riskScore! <= 70 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                      'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        <RiskIcon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${riskInfo.color}`} />
                        <div>
                          <p className={`text-xs font-bold ${riskInfo.color}`}>Aanbeveling</p>
                          <p className="text-xs mt-0.5" data-testid="text-advice">{riskInfo.advice}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.paymentBehavior && (
                    <div className="grid grid-cols-4 gap-2">
                      <Card>
                        <CardContent className="p-2 text-center">
                          <FileText className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
                          <div className="text-sm font-bold">{result.paymentBehavior.totalInvoices}</div>
                          <div className="text-[10px] text-muted-foreground">Facturen</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-2 text-center">
                          <CheckCircle className="h-3 w-3 mx-auto text-green-500 mb-0.5" />
                          <div className="text-sm font-bold text-green-600">{result.paymentBehavior.paidInvoices}</div>
                          <div className="text-[10px] text-muted-foreground">Betaald</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-2 text-center">
                          <Clock className="h-3 w-3 mx-auto text-orange-500 mb-0.5" />
                          <div className="text-sm font-bold text-orange-600">
                            {parseFloat(result.paymentBehavior.avgDaysLate || '0').toFixed(0)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">Dagen laat</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-2 text-center">
                          <div className="flex justify-center mb-0.5">
                            {getTrendIcon(result.paymentBehavior.trend)}
                          </div>
                          <div className="text-sm font-bold capitalize">
                            {result.paymentBehavior.trend === 'improving' ? 'Verbeterend' :
                             result.paymentBehavior.trend === 'worsening' ? 'Verslechterend' : 'Stabiel'}
                          </div>
                          <div className="text-[10px] text-muted-foreground">Trend</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/companies/${result.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs" data-testid="button-view-details">
                        Volledige analyse
                      </Button>
                    </Link>
                    <Link href="/upload" className="flex-1">
                      <Button size="sm" className="w-full text-xs" data-testid="button-upload-invoice">
                        <FileText className="h-3 w-3 mr-1" />
                        Factuur uploaden
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="p-6 text-center">
                  <XCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Bedrijf niet gevonden</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    BTW nummer "<strong>{searchVat}</strong>" staat niet in ons netwerk.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Nog geen betalingsdata gedeeld voor dit bedrijf.
                  </p>
                  <div className="mt-3">
                    <Link href="/upload">
                      <Button size="sm" className="text-xs" data-testid="button-upload-new">
                        <FileText className="h-3 w-3 mr-1" />
                        Toevoegen via factuur
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!searchVat && (
          <div className="max-w-md mx-auto text-center py-4">
            <Shield className="h-10 w-10 mx-auto text-primary/30 mb-2" />
            <h3 className="text-sm font-medium">Hoe werkt het?</h3>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-base font-bold mb-1">1</div>
                <p>Voer BTW nummer in</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-base font-bold mb-1">2</div>
                <p>Bekijk risicoscore</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-base font-bold mb-1">3</div>
                <p>Bepaal betalingsvoorwaarden</p>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground text-[10px]">
              Data van 500+ KMO's in België, Nederland en Luxemburg
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
