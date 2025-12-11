import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const dueByAgeData = [
  { range: "<30 Days", amount: 84000, color: "#3b82f6" },
  { range: "30-60 Days", amount: 135000, color: "#3b82f6" },
  { range: "60-90 Days", amount: 220000, color: "#3b82f6" },
  { range: "90-120 Days", amount: 167000, color: "#f97316" },
  { range: ">120 Days", amount: 251000, color: "#f97316" },
];

const topVendorsByPurchase = [
  { name: "Vendor 1", value: 0.48 },
  { name: "Vendor 2", value: 0.38 },
  { name: "Vendor 3", value: 0.18 },
  { name: "Vendor 4", value: 0.12 },
  { name: "Vendor 5", value: 0.08 },
];

const invoicesOverTime = [
  { month: "Jun-21", purchase: 68, paid: 52, avgCredit: 45 },
  { month: "Jul-21", purchase: 85, paid: 68, avgCredit: 48 },
  { month: "Aug-21", purchase: 92, paid: 75, avgCredit: 50 },
  { month: "Sep-21", purchase: 78, paid: 82, avgCredit: 47 },
  { month: "Oct-21", purchase: 95, paid: 88, avgCredit: 52 },
  { month: "Nov-21", purchase: 88, paid: 92, avgCredit: 49 },
  { month: "Dec-21", purchase: 102, paid: 95, avgCredit: 55 },
  { month: "Jan-22", purchase: 115, paid: 105, avgCredit: 58 },
  { month: "Feb-22", purchase: 125, paid: 112, avgCredit: 62 },
  { month: "Mar-22", purchase: 145, paid: 128, avgCredit: 65 },
  { month: "Apr-22", purchase: 168, paid: 145, avgCredit: 70 },
  { month: "May-22", purchase: 195, paid: 175, avgCredit: 75 },
];

const topVendorsByAmount = [
  { name: "Vendor 1", value: 1.2 },
  { name: "Vendor 2", value: 0.95 },
  { name: "Vendor 3", value: 0.85 },
  { name: "Vendor 4", value: 0.72 },
  { name: "Vendor 5", value: 0.58 },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatK(value: number) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value}`;
}

export default function Register() {
  const bankBalance = 38575;
  const totalDue = 386202;

  return (
    <div className="h-full flex gap-6 overflow-hidden bg-slate-50">
      <div className="flex flex-col gap-4 w-48 flex-shrink-0">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 font-medium mb-1">Bank Balance</p>
            <p className="text-2xl font-bold text-slate-900 font-mono" data-testid="stat-bank-balance">
              ${bankBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 font-medium mb-1">Total Due</p>
            <p className="text-2xl font-bold text-slate-900 font-mono" data-testid="stat-total-due">
              ${totalDue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 min-h-0">
        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Due by Age Summary</CardTitle>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                  </svg>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dueByAgeData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="range" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatK}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Amount"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Top 5 Vendors by Purchase</CardTitle>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                  </svg>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVendorsByPurchase} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}M`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value}M`, "Purchase"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Total Invoices vs Paid Invoices</CardTitle>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                  </svg>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={invoicesOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  fontSize={9} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                  iconType="rect"
                  iconSize={8}
                />
                <Bar dataKey="purchase" fill="#3b82f6" name="Purchase" radius={[2, 2, 0, 0]} />
                <Bar dataKey="paid" fill="#f97316" name="Paid" radius={[2, 2, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="avgCredit" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Avg Credit Terms"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Top 5 Vendors by Amount Due</CardTitle>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                  </svg>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVendorsByAmount} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}M`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value}M`, "Amount Due"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
