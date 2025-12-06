import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import Companies from "@/pages/companies";
import Upload from "@/pages/upload";
import CompanyDetail from "@/pages/company-detail";
import RiskAnalysis from "@/pages/risk-analysis";
import Trends from "@/pages/trends";
import RegisterPayment from "@/pages/register-payment";

function AppLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-7xl">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/invoices" component={Invoices} />
                <Route path="/companies" component={Companies} />
                <Route path="/companies/:id" component={CompanyDetail} />
                <Route path="/upload" component={Upload} />
                <Route path="/risk-analysis" component={RiskAnalysis} />
                <Route path="/trends" component={Trends} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  const [location] = useLocation();
  
  const isPublicRoute = location.startsWith("/register-payment");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isPublicRoute ? (
          <RegisterPayment />
        ) : (
          <AppLayout />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
