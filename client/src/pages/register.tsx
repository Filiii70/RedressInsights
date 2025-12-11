import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend,
  ComposedChart,
} from "recharts";

// Payment behavior demo data - 12 companies
const paymentDaysDistribution = [
  { range: "<30 Days", count: 4, color: "#3b82f6" },
  { range: "30-45 Days", count: 3, color: "#3b82f6" },
  { range: "45-60 Days", count: 3, color: "#f97316" },
  { range: ">60 Days", count: 2, color: "#ef4444" },
];

const topAlertCompanies = [
  { name: "BuildRight NV", shift: 28, action: "Escalate" },
  { name: "Steel Works BVBA", shift: 22, action: "Formal Notice" },
  { name: "Transport Pro", shift: 18, action: "Formal Notice" },
  { name: "Logistics Plus", shift: 15, action: "Inform" },
  { name: "PackageCo NV", shift: 12, action: "Inform" },
];

const paymentTrendData = [
  { month: "Jan", avgDays: 28, target: 30 },
  { month: "Feb", avgDays: 29, target: 30 },
  { month: "Mar", avgDays: 31, target: 30 },
  { month: "Apr", avgDays: 32, target: 30 },
  { month: "May", avgDays: 35, target: 30 },
  { month: "Jun", avgDays: 33, target: 30 },
  { month: "Jul", avgDays: 36, target: 30 },
  { month: "Aug", avgDays: 38, target: 30 },
  { month: "Sep", avgDays: 37, target: 30 },
  { month: "Oct", avgDays: 40, target: 30 },
  { month: "Nov", avgDays: 42, target: 30 },
  { month: "Dec", avgDays: 41, target: 30 },
];

const actionDistribution = [
  { action: "Monitor", count: 4, color: "#3b82f6" },
  { action: "Inform", count: 3, color: "#f97316" },
  { action: "Formal Notice", count: 3, color: "#f97316" },
  { action: "Escalate", count: 2, color: "#ef4444" },
];

export default function Register() {
  const companiesTracked = 12;
  const activeAlerts = 5;
  const totalExposure = 857000;

  return (
    <div className="h-full flex gap-6 overflow-hidden bg-slate-50">
      {/* Left KPI Column - exactly 2 cards like example */}
      <div className="flex flex-col gap-4 w-44 flex-shrink-0">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-slate-900 font-mono" data-testid="stat-companies">
              {companiesTracked}
            </p>
            <p className="text-sm text-slate-500 mt-1">Companies Tracked</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-orange-600 font-mono" data-testid="stat-alerts">
              {activeAlerts}
            </p>
            <p className="text-sm text-orange-600 mt-1">Active Alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Right Chart Grid - 2x2 */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 min-h-0">
        {/* Chart 1: Payment Days by Category */}
        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Payment Days by Category</CardTitle>
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentDaysDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="range" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  angle={-15}
                  textAnchor="end"
                  height={45}
                />
                <YAxis 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} companies`, "Count"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Top Alert Companies */}
        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Top Alert Companies</CardTitle>
              <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAlertCompanies} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `+${v}d`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(value: number) => [`+${value} days shift`, "Payment Delay"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="shift" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Payment Trend Over Time - bar+line combo like example */}
        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Payment Trend Over Time</CardTitle>
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paymentTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  domain={[20, 50]}
                  tickFormatter={(v) => `${v}d`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} days`, 
                    name === "avgDays" ? "Avg Payment" : "Target"
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                  iconType="rect"
                  iconSize={8}
                />
                <Bar 
                  dataKey="avgDays" 
                  fill="#3b82f6" 
                  name="Avg Payment Days" 
                  radius={[4, 4, 0, 0]} 
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="30-Day Target"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Actions Required */}
        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Actions Required</CardTitle>
              <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="action" 
                  type="category" 
                  fontSize={10} 
                  stroke="#64748b" 
                  tickLine={false}
                  axisLine={false}
                  width={85}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} companies`, "Count"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[0, 4, 4, 0]}
                  fill="#f97316"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
