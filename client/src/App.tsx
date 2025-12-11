import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { TrendingUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Register from "@/pages/register";

function SettingsDialog() {
  const [email, setEmail] = useState("");
  const [patternAlerts, setPatternAlerts] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-settings-email"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pattern Change Alerts</p>
              <p className="text-xs text-muted-foreground">
                Notify when payment behavior changes
              </p>
            </div>
            <Switch
              checked={patternAlerts}
              onCheckedChange={setPatternAlerts}
              data-testid="switch-pattern-alerts"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Overdue Alerts</p>
              <p className="text-xs text-muted-foreground">
                Notify when invoices become overdue
              </p>
            </div>
            <Switch
              checked={overdueAlerts}
              onCheckedChange={setOverdueAlerts}
              data-testid="switch-overdue-alerts"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
          <header className="flex-shrink-0 flex h-14 items-center justify-between border-b px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold tracking-tight" data-testid="text-brand-name">
                  PayTrend
                </span>
                <span className="text-xs text-muted-foreground">.be</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDialog />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-hidden p-4">
            <div className="mx-auto max-w-7xl h-full min-h-0">
              <Register />
            </div>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
