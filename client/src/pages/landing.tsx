import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Bell, Users, Zap, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="h-full flex flex-col">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">KMO-Alert</span>
        </div>
        <Button size="sm" asChild data-testid="button-login">
          <a href="/api/login">Inloggen</a>
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
        <div className="text-center max-w-2xl mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3" data-testid="text-hero-title">
            Betalingsgedrag van KMO's
            <span className="text-primary"> in realtime</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            De Graydon voor KMO's — maar realtime, crowd-sourced en betaalbaar.
            <br />
            Bescherm je bedrijf tegen wanbetalers met AI-analyse en netwerk-effecten.
          </p>
          <Button size="lg" asChild data-testid="button-get-started">
            <a href="/api/login">Start gratis</a>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-3xl w-full">
          <Card className="overflow-visible">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-3">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">AI Extractie</h3>
              <p className="text-xs text-muted-foreground">
                Upload facturen, AI leest alle data automatisch
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Risicoscores</h3>
              <p className="text-xs text-muted-foreground">
                Realtime risico-analyse van elke klant
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-3">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Alerts</h3>
              <p className="text-xs text-muted-foreground">
                Notificaties via email, SMS en WhatsApp
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Crowd-sourced</h3>
              <p className="text-xs text-muted-foreground">
                Netwerk-effect met andere ondernemers
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Trends</h3>
              <p className="text-xs text-muted-foreground">
                Historische trends en voorspellingen
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-3">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">GDPR</h3>
              <p className="text-xs text-muted-foreground">
                Alleen zakelijke data, 100% GDPR-conform
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="flex-shrink-0 text-center p-4 text-xs text-muted-foreground border-t bg-card">
        KMO-Alert — Benelux B2B betalingsplatform
      </footer>
    </div>
  );
}
