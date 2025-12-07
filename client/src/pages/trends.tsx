import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Trends() {
  const [timeRange, setTimeRange] = useState("6m");

  const allPaymentTrendData = [
    { month: "Dec 23", avgDaysLate: 8, totalOverdue: 5200 },
    { month: "Jan", avgDaysLate: 10, totalOverdue: 6800 },
    { month: "Feb", avgDaysLate: 9, totalOverdue: 6100 },
    { month: "Mrt", avgDaysLate: 11, totalOverdue: 7500 },
    { month: "Apr", avgDaysLate: 10, totalOverdue: 7000 },
    { month: "Mei", avgDaysLate: 13, totalOverdue: 9200 },
    { month: "Jun", avgDaysLate: 12, totalOverdue: 8500 },
    { month: "Jul", avgDaysLate: 15, totalOverdue: 12000 },
    { month: "Aug", avgDaysLate: 11, totalOverdue: 9200 },
    { month: "Sep", avgDaysLate: 18, totalOverdue: 15800 },
    { month: "Okt", avgDaysLate: 22, totalOverdue: 21000 },
    { month: "Nov", avgDaysLate: 19, totalOverdue: 18500 },
  ];

  const allInvoiceVolumeData = [
    { month: "Dec 23", invoices: 18, amount: 32000 },
    { month: "Jan", invoices: 22, amount: 41000 },
    { month: "Feb", invoices: 20, amount: 38000 },
    { month: "Mrt", invoices: 26, amount: 48000 },
    { month: "Apr", invoices: 23, amount: 43000 },
    { month: "Mei", invoices: 29, amount: 54000 },
    { month: "Jun", invoices: 24, amount: 45000 },
    { month: "Jul", invoices: 31, amount: 58000 },
    { month: "Aug", invoices: 28, amount: 52000 },
    { month: "Sep", invoices: 35, amount: 67000 },
    { month: "Okt", invoices: 42, amount: 78000 },
    { month: "Nov", invoices: 38, amount: 72000 },
  ];

  const allRiskTrendData = [
    { month: "Dec 23", low: 50, medium: 30, high: 15, critical: 5 },
    { month: "Jan", low: 48, medium: 32, high: 14, critical: 6 },
    { month: "Feb", low: 47, medium: 33, high: 15, critical: 5 },
    { month: "Mrt", low: 46, medium: 34, high: 14, critical: 6 },
    { month: "Apr", low: 45, medium: 35, high: 14, critical: 6 },
    { month: "Mei", low: 44, medium: 36, high: 15, critical: 5 },
    { month: "Jun", low: 45, medium: 35, high: 15, critical: 5 },
    { month: "Jul", low: 42, medium: 38, high: 14, critical: 6 },
    { month: "Aug", low: 48, medium: 32, high: 15, critical: 5 },
    { month: "Sep", low: 40, medium: 38, high: 16, critical: 6 },
    { month: "Okt", low: 35, medium: 40, high: 18, critical: 7 },
    { month: "Nov", low: 38, medium: 37, high: 17, critical: 8 },
  ];

  const getDataSlice = <T,>(data: T[]) => {
    switch (timeRange) {
      case "3m":
        return data.slice(-3);
      case "6m":
        return data.slice(-6);
      case "1y":
        return data;
      default:
        return data.slice(-6);
    }
  };

  const paymentTrendData = useMemo(() => getDataSlice(allPaymentTrendData), [timeRange]);
  const invoiceVolumeData = useMemo(() => getDataSlice(allInvoiceVolumeData), [timeRange]);
  const riskTrendData = useMemo(() => getDataSlice(allRiskTrendData), [timeRange]);

  const cashflowData = [
    { month: "Dec", expected: 52000, atRisk: 12000 },
    { month: "Jan", expected: 38000, atRisk: 5000 },
    { month: "Feb", expected: 45000, atRisk: 9000 },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2" data-testid="text-page-title">
            <TrendingUp className="h-5 w-5" />
            Trends
          </h1>
          <p className="text-xs text-muted-foreground">Historische trends en voorspellingen</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 h-8 text-xs" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 maanden</SelectItem>
            <SelectItem value="6m">6 maanden</SelectItem>
            <SelectItem value="1y">1 jaar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Betalingsgedrag</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v}d`} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="avgDaysLate" name="Dagen" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                  <Line yAxisId="right" type="monotone" dataKey="totalOverdue" name="Achterstallig" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 flex-shrink-0 pt-1">
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-primary" />Dagen laat</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-destructive" />Totaal achterstallig</div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Factuurvolume</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={invoiceVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} />
                  <Area yAxisId="right" type="monotone" dataKey="amount" name="Bedrag" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="invoices" name="Facturen" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 flex-shrink-0 pt-1">
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-primary" />Bedrag</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />Facturen</div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Risicoverdeling Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} />
                  <Area type="monotone" dataKey="critical" name="Kritiek" stackId="1" fill="#ef4444" stroke="#ef4444" />
                  <Area type="monotone" dataKey="high" name="Hoog" stackId="1" fill="#f97316" stroke="#f97316" />
                  <Area type="monotone" dataKey="medium" name="Gemiddeld" stackId="1" fill="#eab308" stroke="#eab308" />
                  <Area type="monotone" dataKey="low" name="Laag" stackId="1" fill="#22c55e" stroke="#22c55e" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 flex-shrink-0 pt-1">
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-green-500" />Laag</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-yellow-500" />Gemiddeld</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-orange-500" />Hoog</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-red-500" />Kritiek</div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Cashflow Voorspelling</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="expected" name="Verwacht" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="atRisk" name="Risico" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 flex-shrink-0 pt-1">
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-primary" />Verwacht</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-destructive" />Risico</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
