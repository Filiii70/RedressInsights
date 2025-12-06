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
        <div className="text-center border-b pb-6 print:pb-4">
          <h1 className="text-3xl font-bold text-primary print:text-2xl">KMO-Alert</h1>
          <p className="text-lg text-muted-foreground mt-2 print:text-base">
            "De Graydon voor KMO's — maar realtime, crowd-sourced en betaalbaar"
          </p>
        </div>

        {/* Concept */}
        <Card className="print:shadow-none print:border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl print:text-lg">
              <Users className="h-5 w-5 text-primary" />
              Het Concept in het Kort
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm print:text-xs">
            <p>
              KMO-Alert is een <strong>crowd-sourced platform</strong> waar bedrijven samen betalingsgedrag delen. 
              Denk aan het als een <strong>"Waze voor facturen"</strong> — iedereen draagt bij, iedereen profiteert.
            </p>
            <p>
              Wanneer een bedrijf te laat betaalt bij meerdere leveranciers, weet het hele netwerk dit. 
              Nieuwe leveranciers worden gewaarschuwd. Betrouwbare betalers krijgen betere voorwaarden.
            </p>
            <div className="bg-primary/5 p-3 rounded-lg print:bg-gray-100">
              <strong>Het resultaat:</strong> Minder wanbetalers, snellere betalingen, betere cashflow voor iedereen.
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 print:gap-2">
          
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base print:text-sm">
                <Upload className="h-4 w-4 text-blue-500" />
                Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm print:text-xs">
              <p>Upload facturen via foto of PDF. AI leest automatisch alle gegevens uit: bedrijfsnaam, BTW-nummer, bedrag en vervaldatum.</p>
              <p className="mt-2 text-muted-foreground italic">
                "Sophie maakt een foto van een factuur. De AI herkent alles automatisch — alleen bevestigen en klaar!"
              </p>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base print:text-sm">
                <Shield className="h-4 w-4 text-red-500" />
                Risico Analyse
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm print:text-xs">
              <p>Bekijk risicoscores van 0-100 voor elk bedrijf. Zie hoeveel dagen ze gemiddeld te laat betalen en wat de trend is.</p>
              <p className="mt-2 text-muted-foreground italic">
                "Pieter checkt 'Transport Janssen': score 35, laatste 3 facturen op tijd. Groen licht om te leveren!"
              </p>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base print:text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm print:text-xs">
              <p>Volg betalingsgedrag over tijd. Ontdek seizoenspatronen en vergelijk met vorige periodes.</p>
              <p className="mt-2 text-muted-foreground italic">
                "Lisa ziet dat klanten in december 8 dagen later betalen. Dit jaar stuurt ze herinneringen eerder!"
              </p>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base print:text-sm">
                <Bell className="h-4 w-4 text-orange-500" />
                Blacklist & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm print:text-xs">
              <p>Automatische waarschuwingen voor bedrijven met hoog risico. Het hele netwerk wordt beschermd.</p>
              <p className="mt-2 text-muted-foreground italic">
                "Bouwwerken X komt op de blacklist — score 85. Tom vraagt nu vooruitbetaling voor zijn offerte."
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Leaderboard explanation */}
        <Card className="print:shadow-none print:border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl print:text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Gamification: Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm print:text-xs space-y-2">
            <p>
              De <strong>Top 10 Netwerkleden</strong> toont bedrijven die het meest bijdragen aan het platform.
              Dit zijn de leden die facturen uploaden en betalingsdata delen — niet de bedrijven die beoordeeld worden.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg print:bg-gray-100">
              <strong>Hoe werkt het?</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>📄 <strong>Facturen uploaden</strong> over jouw klanten = punten</li>
                <li>💳 <strong>Betalingen registreren</strong> die je ontvangt = punten</li>
                <li>🔥 <strong>Streaks</strong> = dagelijks actief blijven</li>
                <li>🏆 <strong>Ranking</strong> = meer bijdragen = hogere positie</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Network Power */}
        <Card className="bg-primary/5 print:bg-gray-50 print:shadow-none print:border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl print:text-lg">De Kracht van het Netwerk</CardTitle>
          </CardHeader>
          <CardContent className="text-sm print:text-xs space-y-3">
            <p>
              Stel je voor: <strong>500 KMO's delen hun betalingservaring</strong>. Als "Probleem BV" bij 10 
              verschillende leveranciers te laat betaalt, weet iedereen dit.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white dark:bg-gray-800 p-3 rounded print:border">
                <div className="text-2xl font-bold text-primary print:text-xl">500+</div>
                <div className="text-xs text-muted-foreground">Leden</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded print:border">
                <div className="text-2xl font-bold text-green-600 print:text-xl">10.000+</div>
                <div className="text-xs text-muted-foreground">Facturen</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded print:border">
                <div className="text-2xl font-bold text-orange-600 print:text-xl">Realtime</div>
                <div className="text-xs text-muted-foreground">Updates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4 print:text-xs">
          <p><strong>www.kmo-alert.be</strong></p>
          <p>Crowd-sourced betalingsdata voor Belgische en Nederlandse KMO's</p>
        </div>

      </div>
    </div>
  );
}
