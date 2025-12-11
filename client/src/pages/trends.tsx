import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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
} from "recharts";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Trends() {
  const [timeRange, setTimeRange] = useState("6m");

  const allPaymentData = [
    { month: "Dec", avgDays: 8, onTime: 92 },
    { month: "Jan", avgDays: 10, onTime: 88 },
    { month: "Feb", avgDays: 9, onTime: 90 },
    { month: "Mar", avgDays: 11, onTime: 85 },
    { month: "Apr", avgDays: 10, onTime: 87 },
    { month: "May", avgDays: 13, onTime: 82 },
    { month: "Jun", avgDays: 12, onTime: 84 },
    { month: "Jul", avgDays: 15, onTime: 78 },
    { month: "Aug", avgDays: 11, onTime: 86 },
    { month: "Sep", avgDays: 18, onTime: 72 },
    { month: "Oct", avgDays: 22, onTime: 65 },
    { month: "Nov", avgDays: 19, onTime: 70 },
  ];

  const allVolumeData = [
    { month: "Dec", invoices: 18, amount: 32000 },
    { month: "Jan", invoices: 22, amount: 41000 },
    { month: "Feb", invoices: 20, amount: 38000 },
    { month: "Mar", invoices: 26, amount: 48000 },
    { month: "Apr", invoices: 23, amount: 43000 },
    { month: "May", invoices: 29, amount: 54000 },
    { month: "Jun", invoices: 24, amount: 45000 },
    { month: "Jul", invoices: 31, amount: 58000 },
    { month: "Aug", invoices: 28, amount: 52000 },
    { month: "Sep", invoices: 35, amount: 67000 },
    { month: "Oct", invoices: 42, amount: 78000 },
    { month: "Nov", invoices: 38, amount: 72000 },
  ];

  const getDataSlice = <T,>(data: T[]) => {
    switch (timeRange) {
      case "3m": return data.slice(-3);
      case "6m": return data.slice(-6);
      case "1y": return data;
      default: return data.slice(-6);
    }
  };

  const paymentData = useMemo(() => getDataSlice(allPaymentData), [timeRange]);
  const volumeData = useMemo(() => getDataSlice(allVolumeData), [timeRange]);

  const currentAvg = paymentData[paymentData.length - 1]?.avgDays || 0;
  const previousAvg = paymentData[paymentData.length - 2]?.avgDays || 0;
  const trend = currentAvg > previousAvg ? "up" : currentAvg < previousAvg ? "down" : "stable";

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <TrendingUp className="h-5 w-5" />
            Trends
          </h1>
          <p className="text-sm text-muted-foreground">Payment behavior over time</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 months</SelectItem>
            <SelectItem value="6m">6 months</SelectItem>
            <SelectItem value="1y">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-shrink-0">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg. Days to Pay</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{currentAvg}</p>
              {trend === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
              {trend === "down" && <TrendingDown className="h-4 w-4 text-green-500" />}
              {trend === "stable" && <Minus className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">On-Time Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {paymentData[paymentData.length - 1]?.onTime || 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold">
              {formatCurrency(volumeData.reduce((sum, d) => sum + d.amount, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm">Average Days to Payment</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}d`} />
                <Tooltip 
                  formatter={(value: number) => [`${value} days`, "Avg"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgDays" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm">Invoice Volume</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Amount"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
