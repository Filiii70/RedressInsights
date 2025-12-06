import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Users, Upload, Shield, TrendingUp, Bell, Trophy } from "lucide-react";

export default function About() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col p-4 print:p-0 print:overflow-visible">
      {/* Print button - hidden when printing */}
      <div className="print:hidden flex justify-end flex-shrink-0 mb-2">
        <Button size="sm" onClick={handlePrint} data-testid="button-print-pdf">
          <FileDown className="h-3 w-3 mr-1" />
          PDF
        </Button>
      </div>

      {/* Content - fixed height grid */}
      <div className="flex-1 grid grid-rows-[auto_1fr_auto] gap-2 max-w-4xl mx-auto w-full print:block print:space-y-2">
        
        {/* Header */}
        <div className="text-center border-b pb-2 print:pb-1">
          <h1 className="text-lg font-bold text-primary print:text-base">KMO-Alert</h1>
          <p className="text-xs text-muted-foreground print:text-[10px]">
            "De Graydon voor KMO's — maar realtime, crowd-sourced en betaalbaar"
          </p>
        </div>

        {/* Main content - 2x3 grid */}
        <div className="grid grid-cols-3 grid-rows-2 gap-2 min-h-0">
          
          {/* Concept - spans 2 columns */}
          <Card className="col-span-2 print:shadow-none print:border flex flex-col">
            <CardHeader className="pb-1 pt-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-1.5 text-xs print:text-[10px]">
                <Users className="h-3 w-3 text-primary" />
                Het Concept
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] print:text-[9px] pb-2 flex-1">
              <p className="mb-1">
                KMO-Alert is een <strong>crowd-sourced platform</strong> — een "Waze voor facturen".
              </p>
              <p className="mb-1">
                Bedrijven delen betalingsgedrag. Als iemand te laat betaalt, weet het hele netwerk dit.
              </p>
              <div className="bg-primary/5 p-1.5 rounded text-[10px] print:bg-gray-100">
                <strong>Resultaat:</strong> Minder wanbetalers, snellere betalingen, betere cashflow.
              </div>
            </CardContent>
          </Card>

          {/* Network Stats */}
          <Card className="print:shadow-none print:border flex flex-col">
            <CardHeader className="pb-1 pt-2 flex-shrink-0">
              <CardTitle className="text-xs print:text-[10px]">Netwerk</CardTitle>
            </CardHeader>
            <CardContent className="pb-2 flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="p-1">
                  <div className="text-sm font-bold text-primary">500+</div>
                  <div className="text-[9px] text-muted-foreground">Leden</div>
                </div>
                <div className="p-1">
                  <div className="text-sm font-bold text-green-600">10K+</div>
                  <div className="text-[9px] text-muted-foreground">Facturen</div>
                </div>
                <div className="p-1">
                  <div className="text-sm font-bold text-orange-600">Live</div>
                  <div className="text-[9px] text-muted-foreground">Updates</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload */}
          <Card className="print:shadow-none print:border flex flex-col">
            <CardHeader className="pb-1 pt-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-1 text-xs print:text-[10px]">
                <Upload className="h-3 w-3 text-blue-500" />
                Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] print:text-[9px] pb-2 flex-1">
              <p>Upload facturen via foto of PDF. AI leest automatisch alle gegevens uit.</p>
            </CardContent>
          </Card>

          {/* Risico */}
          <Card className="print:shadow-none print:border flex flex-col">
            <CardHeader className="pb-1 pt-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-1 text-xs print:text-[10px]">
                <Shield className="h-3 w-3 text-red-500" />
                Risico
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] print:text-[9px] pb-2 flex-1">
              <p>Risicoscores 0-100. Zie dagen te laat en trend per bedrijf.</p>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="print:shadow-none print:border flex flex-col">
            <CardHeader className="pb-1 pt-2 flex-shrink-0">
              <CardTitle className="flex items-center gap-1 text-xs print:text-[10px]">
                <Bell className="h-3 w-3 text-orange-500" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] print:text-[9px] pb-2 flex-1">
              <p>Automatische waarschuwingen en blacklist voor hoog-risico bedrijven.</p>
            </CardContent>
          </Card>

        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-muted-foreground border-t pt-2 print:text-[9px] flex-shrink-0">
          <p><strong>www.kmo-alert.be</strong> — Crowd-sourced betalingsdata voor Benelux KMO's</p>
          <a href="mailto:hello@kmo-alert.be" className="text-primary hover:underline">hello@kmo-alert.be</a>
        </div>

      </div>
    </div>
  );
}
