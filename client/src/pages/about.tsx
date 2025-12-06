import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Users, Upload, Shield, TrendingUp, Bell, Trophy } from "lucide-react";

export default function About() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full overflow-auto p-6 print:p-0 print:overflow-visible">
      {/* Print button - hidden when printing */}
      <div className="print:hidden mb-4 flex justify-end">
        <Button onClick={handlePrint} data-testid="button-print-pdf">
          <FileDown className="h-4 w-4 mr-2" />
          Opslaan als PDF
        </Button>
      </div>

      {/* Content - optimized for print */}
      <div className="max-w-3xl mx-auto space-y-6 print:space-y-4">
        
        {/* Header */}
        <div className="text-center border-b pb-4 print:pb-3">
          <h1 className="text-xl font-bold text-primary print:text-lg">KMO-Alert</h1>
          <p className="text-sm text-muted-foreground mt-1 print:text-xs">
            "De Graydon voor KMO's — maar realtime, crowd-sourced en betaalbaar"
          </p>
        </div>

        {/* Concept */}
        <Card className="print:shadow-none print:border">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm print:text-xs">
              <Users className="h-4 w-4 text-primary" />
              Het Concept in het Kort
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs print:text-[10px]">
            <p>
              KMO-Alert is een <strong>crowd-sourced platform</strong> waar bedrijven samen betalingsgedrag delen. 
              Denk aan het als een <strong>"Waze voor facturen"</strong> — iedereen draagt bij, iedereen profiteert.
            </p>
            <p>
              Wanneer een bedrijf te laat betaalt bij meerdere leveranciers, weet het hele netwerk dit. 
              Nieuwe leveranciers worden gewaarschuwd. Betrouwbare betalers krijgen betere voorwaarden.
            </p>
            <div className="bg-primary/5 p-2 rounded-lg print:bg-gray-100 text-xs">
              <strong>Het resultaat:</strong> Minder wanbetalers, snellere betalingen, betere cashflow.
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-2 print:gap-1">
          
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-1 pt-2">
              <CardTitle className="flex items-center gap-1.5 text-xs print:text-[10px]">
                <Upload className="h-3 w-3 text-blue-500" />
                Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] print:text-[9px] pb-2">
              <p>Upload facturen via foto of PDF. AI leest automatisch alle gegevens uit.</p>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-1 pt-2">
              <CardTitle className="flex items-center gap-1.5 text-xs print:text-[10px]">
                <Shield className="h-3 w-3 text-red-500" />
                Risico Analyse
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] print:text-[9px] pb-2">
              <p>Risicoscores van 0-100. Zie gemiddelde dagen te laat en trend.</p>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-1 pt-2">
              <CardTitle className="flex items-center gap-1.5 text-xs print:text-[10px]">
                <TrendingUp className="h-3 w-3 text-green-500" />
                Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] print:text-[9px] pb-2">
              <p>Volg betalingsgedrag over tijd. Ontdek seizoenspatronen.</p>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-1 pt-2">
              <CardTitle className="flex items-center gap-1.5 text-xs print:text-[10px]">
                <Bell className="h-3 w-3 text-orange-500" />
                Blacklist & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] print:text-[9px] pb-2">
              <p>Automatische waarschuwingen voor bedrijven met hoog risico.</p>
            </CardContent>
          </Card>

        </div>

        {/* Leaderboard explanation */}
        <Card className="print:shadow-none print:border">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="flex items-center gap-1.5 text-sm print:text-xs">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs print:text-[10px] space-y-1.5 pb-3">
            <p>
              <strong>Top 10 Beste Betalers</strong> toont bedrijven met de laagste risicoscores.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg print:bg-gray-100 text-[11px]">
              Facturen uploaden, betalingen registreren, streaks opbouwen = punten!
            </div>
          </CardContent>
        </Card>

        {/* Network Power */}
        <Card className="bg-primary/5 print:bg-gray-50 print:shadow-none print:border">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm print:text-xs">De Kracht van het Netwerk</CardTitle>
          </CardHeader>
          <CardContent className="text-xs print:text-[10px] space-y-2 pb-3">
            <p>
              <strong>500+ KMO's</strong> delen betalingservaringen in Belgie, Nederland en Luxemburg.
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-white dark:bg-gray-800 p-2 rounded print:border">
                <div className="text-sm font-bold text-primary">500+</div>
                <div className="text-[10px] text-muted-foreground">Leden</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded print:border">
                <div className="text-sm font-bold text-green-600">10.000+</div>
                <div className="text-[10px] text-muted-foreground">Facturen</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded print:border">
                <div className="text-sm font-bold text-orange-600">Realtime</div>
                <div className="text-[10px] text-muted-foreground">Updates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground border-t pt-3 print:text-[10px]">
          <p><strong>www.kmo-alert.be</strong></p>
          <p>Crowd-sourced betalingsdata voor Benelux KMO's</p>
          <a href="mailto:hello@kmo-alert.be" className="text-primary hover:underline">hello@kmo-alert.be</a>
        </div>

      </div>
    </div>
  );
}
