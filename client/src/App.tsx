import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import Companies from "@/pages/companies";
import Upload from "@/pages/upload";
import CompanyDetail from "@/pages/company-detail";
import RiskAnalysis from "@/pages/risk-analysis";
import Trends from "@/pages/trends";
import RegisterPayment from "@/pages/register-payment";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";

function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

function AppLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 h-full">
          <header className="flex-shrink-0 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden p-4">
            <div className="mx-auto max-w-7xl h-full min-h-0">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/invoices" component={Invoices} />
                <Route path="/companies" component={Companies} />
                <Route path="/companies/:id" component={CompanyDetail} />
                <Route path="/upload" component={Upload} />
                <Route path="/risk-analysis" component={RiskAnalysis} />
                <Route path="/trends" component={Trends} />
                <Route path="/settings" component={Settings} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  const isPublicRoute = location.startsWith("/register-payment");

  if (isPublicRoute) {
    return <RegisterPayment />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AppLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthenticatedApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
