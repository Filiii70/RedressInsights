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
          Save as PDF
        </Button>
      </div>

      {/* Content - optimized for print */}
      <div className="max-w-3xl mx-auto space-y-6 print:space-y-4">
        
        {/* Header */}
        <div className="text-center border-b pb-4 print:pb-3">
          <h1 className="text-xl font-bold text-primary print:text-lg">KMO-Alert</h1>
          <p className="text-sm text-muted-foreground mt-1 print:text-xs">
            "The Graydon for SMEs — but realtime, crowd-sourced and affordable"
          </p>
        </div>

        {/* Concept */}
        <Card className="print:shadow-none print:border">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm print:text-xs">
              <Users className="h-4 w-4 text-primary" />
              The Concept in Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs print:text-[10px]">
            <p>
              KMO-Alert is a <strong>crowd-sourced platform</strong> where businesses share payment behavior together. 
              Think of it as <strong>"Waze for invoices"</strong> — everyone contributes, everyone benefits.
            </p>
            <p>
              When a company pays late to multiple suppliers, the entire network knows. 
              New suppliers are warned. Reliable payers get better terms.
            </p>
            <div className="bg-primary/5 p-2 rounded-lg print:bg-gray-100 text-xs">
              <strong>The result:</strong> Fewer bad payers, faster payments, better cash flow.
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
              <p>Upload invoices via photo or PDF. AI automatically reads all data.</p>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-1 pt-2">
              <CardTitle className="flex items-center gap-1.5 text-xs print:text-[10px]">
                <Shield className="h-3 w-3 text-red-500" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] print:text-[9px] pb-2">
              <p>Risk scores from 0-100. See average days late and trend.</p>
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
              <p>Track payment behavior over time. Discover seasonal patterns.</p>
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
              <p>Automatic warnings for high-risk companies.</p>
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
              <strong>Top 10 Best Payers</strong> shows companies with the lowest risk scores.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg print:bg-gray-100 text-[11px]">
              Upload invoices, register payments, build streaks = points!
            </div>
          </CardContent>
        </Card>

        {/* Network Power */}
        <Card className="bg-primary/5 print:bg-gray-50 print:shadow-none print:border">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm print:text-xs">The Power of the Network</CardTitle>
          </CardHeader>
          <CardContent className="text-xs print:text-[10px] space-y-2 pb-3">
            <p>
              <strong>500+ SMEs</strong> share payment experiences in Belgium, Netherlands and Luxembourg.
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-white dark:bg-gray-800 p-2 rounded print:border">
                <div className="text-sm font-bold text-primary">500+</div>
                <div className="text-[10px] text-muted-foreground">Members</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded print:border">
                <div className="text-sm font-bold text-green-600">10,000+</div>
                <div className="text-[10px] text-muted-foreground">Invoices</div>
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
          <p>Crowd-sourced payment data for Benelux SMEs</p>
          <p>+32 494 76 75 77</p>
        </div>

      </div>
    </div>
  );
}
