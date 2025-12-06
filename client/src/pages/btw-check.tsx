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
    advice: "Enige vertraging mogelijk. Overweeg kortere betalingstermijnen of deelbetalingen."
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
    advice: "Zeer hoog risico! Alleen vooruitbetaling of geen krediet verlenen."
  };
}

function getTrendIcon(trend: string | null | undefined) {
  switch (trend) {
    case 'improving': return <TrendingUp className="h-3 w-3 text-green-500" />;
    case 'worsening': return <TrendingDown className="h-3 w-3 text-red-500" />;
    default: return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
}

export default function BTWCheck() {
  const [searchInput, setSearchInput] = useState("");
  const [searchVat, setSearchVat] = useState<string | null>(null);

  const { data: result, isLoading, isFetched } = useQuery<CompanyWithBehavior | null>({
    queryKey: ["/api/companies/lookup", searchVat],
    enabled: !!searchVat,
  });

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
      {/* Header */}
      <div className="flex-shrink-0 text-center">
        <h1 className="text-xl font-bold flex items-center justify-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          BTW-nummer Check
        </h1>
        <p className="text-sm text-muted-foreground">
          Controleer of een bedrijf betrouwbaar is voor factuurvoorwaarden
        </p>
      </div>

      {/* Search Box - Prominent */}
      <Card className="flex-shrink-0 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="max-w-xl mx-auto">
            <label className="text-sm font-medium mb-2 block">Voer BTW-nummer in</label>
            <div className="flex gap-3">
              <Input
                placeholder="BE0123456789 of NL123456789B01"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-base h-12"
                data-testid="input-btw-search-main"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading || searchInput.length < 8}
                className="h-12 px-6"
                data-testid="button-btw-search-main"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Zoeken
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Belgische (BE) en Nederlandse (NL) BTW-nummers worden ondersteund
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results Area */}
      <div className="flex-1 min-h-0 overflow-auto">
        {searchVat && isFetched && (
          <div className="max-w-2xl mx-auto">
            {result ? (
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="truncate" data-testid="text-company-name">{result.name}</span>
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{result.vatNumber}</span>
                        <span>•</span>
                        <span>{result.sector}</span>
                        <span>•</span>
                        <span>{result.country}</span>
                      </div>
                    </div>
                    {riskInfo && (
                      <Badge className={`${riskInfo.bgColor} text-white text-sm px-3 py-1`} data-testid="badge-risk-score">
                        <RiskIcon className="h-4 w-4 mr-1.5" />
                        {riskScore}% - {riskInfo.label}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Risk Advice - Large and prominent */}
                  {riskInfo && (
                    <div className={`p-4 rounded-lg border-2 ${
                      riskScore! <= 50 ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                      riskScore! <= 70 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                      'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    }`}>
                      <div className="flex items-start gap-3">
                        <RiskIcon className={`h-6 w-6 flex-shrink-0 ${riskInfo.color}`} />
                        <div>
                          <p className={`font-bold ${riskInfo.color}`}>Advies voor Factuurvoorwaarden</p>
                          <p className="text-sm mt-1" data-testid="text-advice">{riskInfo.advice}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  {result.paymentBehavior && (
                    <div className="grid grid-cols-4 gap-3">
                      <Card>
                        <CardContent className="p-3 text-center">
                          <FileText className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                          <div className="text-xl font-bold">{result.paymentBehavior.totalInvoices}</div>
                          <div className="text-xs text-muted-foreground">Facturen</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <CheckCircle className="h-4 w-4 mx-auto text-green-500 mb-1" />
                          <div className="text-xl font-bold text-green-600">{result.paymentBehavior.paidInvoices}</div>
                          <div className="text-xs text-muted-foreground">Betaald</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <Clock className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                          <div className="text-xl font-bold text-orange-600">
                            {parseFloat(result.paymentBehavior.avgDaysLate || '0').toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Dagen laat</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="flex justify-center mb-1">
                            {getTrendIcon(result.paymentBehavior.trend)}
                          </div>
                          <div className="text-xl font-bold capitalize">
                            {result.paymentBehavior.trend === 'improving' ? 'Beter' :
                             result.paymentBehavior.trend === 'worsening' ? 'Slechter' : 'Stabiel'}
                          </div>
                          <div className="text-xs text-muted-foreground">Trend</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link href={`/companies/${result.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" data-testid="button-view-details">
                        Bekijk volledige analyse
                      </Button>
                    </Link>
                    <Link href="/upload" className="flex-1">
                      <Button className="w-full" data-testid="button-upload-invoice">
                        <FileText className="h-4 w-4 mr-2" />
                        Factuur uploaden
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Company Not Found */
              <Card className="border-2 border-dashed">
                <CardContent className="p-8 text-center">
                  <XCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Bedrijf niet gevonden</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    BTW-nummer "<strong>{searchVat}</strong>" is niet bekend in ons netwerk.
                  </p>
                  <p className="text-sm text-muted-foreground mt-3">
                    Dit betekent dat er nog geen betalingsdata is gedeeld over dit bedrijf.
                  </p>
                  <div className="mt-4">
                    <Link href="/upload">
                      <Button data-testid="button-upload-new">
                        <FileText className="h-4 w-4 mr-2" />
                        Voeg toe via factuur upload
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty state - before search */}
        {!searchVat && (
          <div className="max-w-xl mx-auto text-center py-8">
            <Shield className="h-16 w-16 mx-auto text-primary/30 mb-4" />
            <h3 className="text-lg font-medium">Hoe werkt het?</h3>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl mb-2">1</div>
                <p>Voer het BTW-nummer in</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl mb-2">2</div>
                <p>Bekijk de risicoscore</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl mb-2">3</div>
                <p>Bepaal je factuurvoorwaarden</p>
              </div>
            </div>
            <p className="mt-6 text-muted-foreground text-sm">
              Data gebaseerd op betalingservaringen van {">"}500 KMO's in de Benelux
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
