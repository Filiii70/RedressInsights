import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
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

  // Mock trend data - would come from API
  const paymentTrendData = [
    { month: "Jun", avgDaysLate: 12, totalOverdue: 8500 },
    { month: "Jul", avgDaysLate: 15, totalOverdue: 12000 },
    { month: "Aug", avgDaysLate: 11, totalOverdue: 9200 },
    { month: "Sep", avgDaysLate: 18, totalOverdue: 15800 },
    { month: "Okt", avgDaysLate: 22, totalOverdue: 21000 },
    { month: "Nov", avgDaysLate: 19, totalOverdue: 18500 },
  ];

  const invoiceVolumeData = [
    { month: "Jun", invoices: 24, amount: 45000 },
    { month: "Jul", invoices: 31, amount: 58000 },
    { month: "Aug", invoices: 28, amount: 52000 },
    { month: "Sep", invoices: 35, amount: 67000 },
    { month: "Okt", invoices: 42, amount: 78000 },
    { month: "Nov", invoices: 38, amount: 72000 },
  ];

  const riskTrendData = [
    { month: "Jun", low: 45, medium: 35, high: 15, critical: 5 },
    { month: "Jul", low: 42, medium: 38, high: 14, critical: 6 },
    { month: "Aug", low: 48, medium: 32, high: 15, critical: 5 },
    { month: "Sep", low: 40, medium: 38, high: 16, critical: 6 },
    { month: "Okt", low: 35, medium: 40, high: 18, critical: 7 },
    { month: "Nov", low: 38, medium: 37, high: 17, critical: 8 },
  ];

  const cashflowData = [
    { month: "Dec", expected: 52000, atRisk: 12000, received: 0 },
    { month: "Jan", expected: 38000, atRisk: 5000, received: 0 },
    { month: "Feb", expected: 45000, atRisk: 9000, received: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Trends
          </h1>
          <p className="text-muted-foreground mt-1">
            Historische trends en voorspellingen voor je portfolio
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Laatste 3 maanden</SelectItem>
            <SelectItem value="6m">Laatste 6 maanden</SelectItem>
            <SelectItem value="1y">Laatste jaar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Behavior Trend */}
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Betalingsgedrag trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `${v}d`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `€${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "Gem. dagen te laat") return [`${value} dagen`, name];
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgDaysLate"
                    name="Gem. dagen te laat"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalOverdue"
                    name="Totaal te laat"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--destructive))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Gem. dagen te laat</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span>Totaal te laat</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Volume */}
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Factuurvolume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={invoiceVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `€${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "Facturen") return [value, name];
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="amount"
                    name="Bedrag"
                    fill="hsl(var(--primary) / 0.2)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="invoices"
                    name="Facturen"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Totaal bedrag</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
                <span>Aantal facturen</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Over Time */}
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Risicoverdeling over tijd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="low"
                    name="Laag"
                    stackId="1"
                    fill="#22c55e"
                    stroke="#22c55e"
                  />
                  <Area
                    type="monotone"
                    dataKey="medium"
                    name="Medium"
                    stackId="1"
                    fill="#f59e0b"
                    stroke="#f59e0b"
                  />
                  <Area
                    type="monotone"
                    dataKey="high"
                    name="Hoog"
                    stackId="1"
                    fill="#f97316"
                    stroke="#f97316"
                  />
                  <Area
                    type="monotone"
                    dataKey="critical"
                    name="Kritiek"
                    stackId="1"
                    fill="#ef4444"
                    stroke="#ef4444"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Laag</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span>Hoog</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Kritiek</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cashflow Forecast */}
        <Card className="overflow-visible">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Cashflow voorspelling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `€${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Bar
                    dataKey="expected"
                    name="Verwacht"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="atRisk"
                    name="Risico"
                    fill="hsl(var(--destructive))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Verwachte inkomsten</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span>Risico bedrag</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
