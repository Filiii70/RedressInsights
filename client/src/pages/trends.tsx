import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
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

  const paymentTrendData = [
    { month: "Jun", avgDaysLate: 12, totalOverdue: 8500 },
    { month: "Jul", avgDaysLate: 15, totalOverdue: 12000 },
    { month: "Aug", avgDaysLate: 11, totalOverdue: 9200 },
    { month: "Sep", avgDaysLate: 18, totalOverdue: 15800 },
    { month: "Oct", avgDaysLate: 22, totalOverdue: 21000 },
    { month: "Nov", avgDaysLate: 19, totalOverdue: 18500 },
  ];

  const invoiceVolumeData = [
    { month: "Jun", invoices: 24, amount: 45000 },
    { month: "Jul", invoices: 31, amount: 58000 },
    { month: "Aug", invoices: 28, amount: 52000 },
    { month: "Sep", invoices: 35, amount: 67000 },
    { month: "Oct", invoices: 42, amount: 78000 },
    { month: "Nov", invoices: 38, amount: 72000 },
  ];

  const riskTrendData = [
    { month: "Jun", low: 45, medium: 35, high: 15, critical: 5 },
    { month: "Jul", low: 42, medium: 38, high: 14, critical: 6 },
    { month: "Aug", low: 48, medium: 32, high: 15, critical: 5 },
    { month: "Sep", low: 40, medium: 38, high: 16, critical: 6 },
    { month: "Oct", low: 35, medium: 40, high: 18, critical: 7 },
    { month: "Nov", low: 38, medium: 37, high: 17, critical: 8 },
  ];

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
          <p className="text-xs text-muted-foreground">Historical trends and forecasts</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 h-8 text-xs" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 months</SelectItem>
            <SelectItem value="6m">6 months</SelectItem>
            <SelectItem value="1y">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Payment Behavior</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v}d`} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `€${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="avgDaysLate" name="Days" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                  <Line yAxisId="right" type="monotone" dataKey="totalOverdue" name="Overdue" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 flex-shrink-0 pt-1">
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-primary" />Days late</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-destructive" />Total overdue</div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Invoice Volume</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={invoiceVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `€${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} />
                  <Area yAxisId="right" type="monotone" dataKey="amount" name="Amount" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="invoices" name="Invoices" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 flex-shrink-0 pt-1">
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-primary" />Amount</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />Invoices</div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Risk Distribution Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} />
                  <Area type="monotone" dataKey="low" stackId="1" fill="#22c55e" stroke="#22c55e" />
                  <Area type="monotone" dataKey="medium" stackId="1" fill="#f59e0b" stroke="#f59e0b" />
                  <Area type="monotone" dataKey="high" stackId="1" fill="#f97316" stroke="#f97316" />
                  <Area type="monotone" dataKey="critical" stackId="1" fill="#ef4444" stroke="#ef4444" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 flex-shrink-0 pt-1">
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-green-500" />Low</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-amber-500" />Medium</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-orange-500" />High</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-red-500" />Critical</div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col min-h-0">
          <CardHeader className="p-3 pb-1 flex-shrink-0">
            <CardTitle className="text-sm">Cashflow Forecast</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `€${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }} formatter={(value: number) => [formatCurrency(value), ""]} />
                  <Bar dataKey="expected" name="Expected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="atRisk" name="At Risk" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 flex-shrink-0 pt-1">
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-primary" />Expected</div>
              <div className="flex items-center gap-1 text-[10px]"><div className="h-2 w-2 rounded-full bg-destructive" />At Risk</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
