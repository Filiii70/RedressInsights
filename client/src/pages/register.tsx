import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// 124 companies dataset - deterministic data
const companies = [
  // 9 Alert companies (non-monitor)
  { id: 1, name: "BuildRight NV", sector: "Construction", exposure: 125000, avgDays: 68, prevAvgDays: 40, action: "escalate" },
  { id: 2, name: "Steel Works BVBA", sector: "Manufacturing", exposure: 89000, avgDays: 62, prevAvgDays: 40, action: "formal_notice" },
  { id: 3, name: "Transport Pro", sector: "Logistics", exposure: 67000, avgDays: 58, prevAvgDays: 40, action: "formal_notice" },
  { id: 4, name: "Logistics Plus", sector: "Logistics", exposure: 54000, avgDays: 52, prevAvgDays: 37, action: "inform" },
  { id: 5, name: "PackageCo NV", sector: "Retail", exposure: 43000, avgDays: 48, prevAvgDays: 36, action: "inform" },
  { id: 6, name: "MegaBuild BVBA", sector: "Construction", exposure: 98000, avgDays: 65, prevAvgDays: 42, action: "formal_notice" },
  { id: 7, name: "FastFreight", sector: "Logistics", exposure: 76000, avgDays: 55, prevAvgDays: 38, action: "inform" },
  { id: 8, name: "TechSupply NV", sector: "IT Services", exposure: 62000, avgDays: 61, prevAvgDays: 35, action: "escalate" },
  { id: 9, name: "MetalWorks", sector: "Manufacturing", exposure: 51000, avgDays: 49, prevAvgDays: 34, action: "inform" },
  // 115 Monitor companies (good payers) - deterministic using seeded values
  { id: 10, name: "AlphaRetail NV", sector: "Retail", exposure: 32000, avgDays: 24, prevAvgDays: 26, action: "monitor" },
  { id: 11, name: "BetaTech BVBA", sector: "IT Services", exposure: 28000, avgDays: 22, prevAvgDays: 25, action: "monitor" },
  { id: 12, name: "GammaMetal", sector: "Manufacturing", exposure: 41000, avgDays: 27, prevAvgDays: 28, action: "monitor" },
  { id: 13, name: "DeltaLogistics", sector: "Logistics", exposure: 35000, avgDays: 25, prevAvgDays: 27, action: "monitor" },
  { id: 14, name: "EpsilonBuild", sector: "Construction", exposure: 52000, avgDays: 28, prevAvgDays: 29, action: "monitor" },
  { id: 15, name: "ZetaShop", sector: "Retail", exposure: 19000, avgDays: 23, prevAvgDays: 24, action: "monitor" },
  { id: 16, name: "EtaSoftware", sector: "IT Services", exposure: 45000, avgDays: 26, prevAvgDays: 27, action: "monitor" },
  { id: 17, name: "ThetaSteel", sector: "Manufacturing", exposure: 38000, avgDays: 24, prevAvgDays: 26, action: "monitor" },
  { id: 18, name: "IotaTransport", sector: "Logistics", exposure: 29000, avgDays: 25, prevAvgDays: 26, action: "monitor" },
  { id: 19, name: "KappaConstruct", sector: "Construction", exposure: 61000, avgDays: 27, prevAvgDays: 28, action: "monitor" },
  { id: 20, name: "LambdaMart", sector: "Retail", exposure: 22000, avgDays: 22, prevAvgDays: 24, action: "monitor" },
  { id: 21, name: "MuSystems", sector: "IT Services", exposure: 33000, avgDays: 24, prevAvgDays: 25, action: "monitor" },
  { id: 22, name: "NuMetals", sector: "Manufacturing", exposure: 47000, avgDays: 26, prevAvgDays: 27, action: "monitor" },
  { id: 23, name: "XiFreight", sector: "Logistics", exposure: 31000, avgDays: 23, prevAvgDays: 25, action: "monitor" },
  { id: 24, name: "OmicronBuild", sector: "Construction", exposure: 55000, avgDays: 28, prevAvgDays: 29, action: "monitor" },
  // Generate remaining 100 companies deterministically
  ...Array.from({ length: 100 }, (_, i) => {
    const sectors = ["Retail", "IT Services", "Manufacturing", "Logistics", "Construction"];
    const prefixes = ["Pro", "Global", "Euro", "Prime", "Core", "Max", "Top", "First", "Best", "Smart"];
    const suffixes = ["NV", "BVBA", "BV", "SA", ""];
    const baseId = 25 + i;
    return {
      id: baseId,
      name: `${prefixes[i % 10]}${sectors[i % 5].split(" ")[0]} ${suffixes[i % 5]}`.trim(),
      sector: sectors[i % 5],
      exposure: 15000 + (i * 317) % 45000,
      avgDays: 22 + (i * 3) % 8,
      prevAvgDays: 24 + (i * 2) % 6,
      action: "monitor" as const,
    };
  }),
];

// Filter alerts (non-monitor actions)
const alerts = companies.filter(c => c.action !== "monitor");

// Aggregated data for charts
const paymentDaysDistribution = [
  { range: "<30 Days", count: companies.filter(c => c.avgDays < 30).length },
  { range: "30-45 Days", count: companies.filter(c => c.avgDays >= 30 && c.avgDays < 45).length },
  { range: "45-60 Days", count: companies.filter(c => c.avgDays >= 45 && c.avgDays < 60).length },
  { range: ">60 Days", count: companies.filter(c => c.avgDays >= 60).length },
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
  { action: "Monitor", count: companies.filter(c => c.action === "monitor").length },
  { action: "Inform", count: companies.filter(c => c.action === "inform").length },
  { action: "Formal Notice", count: companies.filter(c => c.action === "formal_notice").length },
  { action: "Escalate", count: companies.filter(c => c.action === "escalate").length },
];

function getActionColor(action: string) {
  switch (action) {
    case "escalate": return "bg-red-500 text-white";
    case "formal_notice": return "bg-orange-500 text-white";
    case "inform": return "bg-amber-500 text-white";
    default: return "bg-blue-500 text-white";
  }
}

function getActionLabel(action: string) {
  switch (action) {
    case "escalate": return "Escalate";
    case "formal_notice": return "Formal Notice";
    case "inform": return "Inform";
    default: return "Monitor";
  }
}

type Company = typeof companies[0];

export default function Register() {
  const [selectedAlert, setSelectedAlert] = useState<Company | null>(null);

  const totalExposure = alerts.reduce((sum, c) => sum + c.exposure, 0);

  return (
    <div className="h-full flex gap-6 overflow-hidden bg-slate-50">
      {/* Left Column - KPIs + Alerts List */}
      <div className="flex flex-col gap-3 w-64 flex-shrink-0">
        {/* KPI Cards */}
        <div className="flex gap-3">
          <Card className="bg-white border-0 shadow-sm flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 font-mono" data-testid="stat-companies">
                {companies.length}
              </p>
              <p className="text-xs text-slate-500">Companies</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-sm flex-1 border-l-4 border-l-orange-500">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600 font-mono" data-testid="stat-alerts">
                {alerts.length}
              </p>
              <p className="text-xs text-orange-600">Alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Exposure Card */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900 font-mono" data-testid="stat-exposure">
              €{(totalExposure / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-slate-500">Total Exposure at Risk</p>
          </CardContent>
        </Card>

        {/* Alerts List - All visible, clickable */}
        <Card className="bg-white border-0 shadow-sm flex-1">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold text-slate-700">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="flex flex-col gap-2">
              {alerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left w-full"
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{alert.name}</p>
                    <p className="text-xs text-slate-500">+{alert.avgDays - alert.prevAvgDays}d shift</p>
                  </div>
                  <Badge className={`${getActionColor(alert.action)} text-xs ml-2 flex-shrink-0`}>
                    {getActionLabel(alert.action)}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Chart Grid - 2x2 */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 min-h-0">
        {/* Chart 1: Payment Days by Category */}
        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">Payment Days by Category</CardTitle>
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
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Top Alert Companies */}
        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">Top Alert Companies</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={alerts.slice(0, 5).map(a => ({ name: a.name.length > 12 ? a.name.slice(0, 12) + "..." : a.name, shift: a.avgDays - a.prevAvgDays }))} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(v) => `+${v}d`} />
                <YAxis dataKey="name" type="category" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} width={90} />
                <Tooltip
                  formatter={(value: number) => [`+${value} days shift`, "Payment Delay"]}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="shift" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Payment Trend Over Time */}
        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">Payment Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paymentTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} domain={[20, 50]} tickFormatter={(v) => `${v}d`} />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} days`, name === "avgDays" ? "Avg Payment" : "Target"]}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }} iconType="rect" iconSize={8} />
                <Bar dataKey="avgDays" fill="#3b82f6" name="Avg Payment Days" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="target" stroke="#f97316" strokeWidth={2} strokeDasharray="4 4" dot={false} name="30-Day Target" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Actions Required */}
        <Card className="bg-white border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">Actions Required</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="action" type="category" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} width={85} />
                <Tooltip
                  formatter={(value: number) => [`${value} companies`, "Count"]}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert?.name}
              {selectedAlert && (
                <Badge className={getActionColor(selectedAlert.action)}>
                  {getActionLabel(selectedAlert.action)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Sector</p>
                  <p className="text-sm font-medium">{selectedAlert.sector}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Exposure</p>
                  <p className="text-sm font-medium font-mono">€{selectedAlert.exposure.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Previous Avg</p>
                  <p className="text-sm font-medium font-mono">{selectedAlert.prevAvgDays} days</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Current Avg</p>
                  <p className="text-sm font-medium font-mono text-orange-600">{selectedAlert.avgDays} days</p>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <p className="text-xs text-orange-600 font-medium">Payment Shift</p>
                <p className="text-lg font-bold text-orange-600 font-mono">
                  +{selectedAlert.avgDays - selectedAlert.prevAvgDays} days
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {selectedAlert.action === "escalate" && "Immediate escalation required - significant payment deterioration"}
                  {selectedAlert.action === "formal_notice" && "Send formal notice - payment terms exceeded"}
                  {selectedAlert.action === "inform" && "Contact customer - payment pattern changing"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
