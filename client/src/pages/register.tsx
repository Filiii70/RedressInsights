import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Building2,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Mail,
  FileWarning,
  Scale,
  CheckCircle,
} from "lucide-react";

interface CompanyBehavior {
  id: string;
  name: string;
  vatNumber: string;
  sector: string;
  historicalAvg: number;
  currentDays: number;
  shift: number;
  shiftDirection: "improving" | "stable" | "worsening";
  monthsTracked: number;
  totalInvoices: number;
  totalAmount: number;
  action: "monitor" | "inform" | "formal_notice" | "escalate";
  lastInvoiceDate: string;
}

const demoCompanies: CompanyBehavior[] = [
  {
    id: "1",
    name: "TechFlow Solutions",
    vatNumber: "BE0123.456.789",
    sector: "IT Services",
    historicalAvg: 18,
    currentDays: 45,
    shift: 27,
    shiftDirection: "worsening",
    monthsTracked: 14,
    totalInvoices: 28,
    totalAmount: 156000,
    action: "formal_notice",
    lastInvoiceDate: "2024-11-15",
  },
  {
    id: "2",
    name: "BuildRight Construction",
    vatNumber: "BE0234.567.890",
    sector: "Construction",
    historicalAvg: 25,
    currentDays: 62,
    shift: 37,
    shiftDirection: "worsening",
    monthsTracked: 11,
    totalInvoices: 19,
    totalAmount: 284000,
    action: "escalate",
    lastInvoiceDate: "2024-11-20",
  },
  {
    id: "3",
    name: "Green Gardens NV",
    vatNumber: "BE0345.678.901",
    sector: "Landscaping",
    historicalAvg: 22,
    currentDays: 35,
    shift: 13,
    shiftDirection: "worsening",
    monthsTracked: 9,
    totalInvoices: 15,
    totalAmount: 67500,
    action: "inform",
    lastInvoiceDate: "2024-12-01",
  },
  {
    id: "4",
    name: "FastLogistics BVBA",
    vatNumber: "BE0456.789.012",
    sector: "Transport",
    historicalAvg: 12,
    currentDays: 14,
    shift: 2,
    shiftDirection: "stable",
    monthsTracked: 18,
    totalInvoices: 42,
    totalAmount: 198000,
    action: "monitor",
    lastInvoiceDate: "2024-12-05",
  },
  {
    id: "5",
    name: "Deluxe Interiors",
    vatNumber: "BE0567.890.123",
    sector: "Retail",
    historicalAvg: 30,
    currentDays: 48,
    shift: 18,
    shiftDirection: "worsening",
    monthsTracked: 12,
    totalInvoices: 24,
    totalAmount: 89000,
    action: "inform",
    lastInvoiceDate: "2024-11-28",
  },
  {
    id: "6",
    name: "MediCare Plus",
    vatNumber: "BE0678.901.234",
    sector: "Healthcare",
    historicalAvg: 8,
    currentDays: 6,
    shift: -2,
    shiftDirection: "improving",
    monthsTracked: 24,
    totalInvoices: 56,
    totalAmount: 445000,
    action: "monitor",
    lastInvoiceDate: "2024-12-08",
  },
  {
    id: "7",
    name: "Urban Eats Catering",
    vatNumber: "BE0789.012.345",
    sector: "Hospitality",
    historicalAvg: 28,
    currentDays: 55,
    shift: 27,
    shiftDirection: "worsening",
    monthsTracked: 8,
    totalInvoices: 16,
    totalAmount: 52000,
    action: "formal_notice",
    lastInvoiceDate: "2024-11-18",
  },
  {
    id: "8",
    name: "ProClean Services",
    vatNumber: "BE0890.123.456",
    sector: "Facility Services",
    historicalAvg: 15,
    currentDays: 12,
    shift: -3,
    shiftDirection: "improving",
    monthsTracked: 16,
    totalInvoices: 38,
    totalAmount: 124000,
    action: "monitor",
    lastInvoiceDate: "2024-12-02",
  },
  {
    id: "9",
    name: "DataSync Analytics",
    vatNumber: "BE0901.234.567",
    sector: "IT Services",
    historicalAvg: 20,
    currentDays: 42,
    shift: 22,
    shiftDirection: "worsening",
    monthsTracked: 10,
    totalInvoices: 18,
    totalAmount: 178000,
    action: "formal_notice",
    lastInvoiceDate: "2024-11-22",
  },
  {
    id: "10",
    name: "Prime Manufacturing",
    vatNumber: "BE0012.345.678",
    sector: "Manufacturing",
    historicalAvg: 35,
    currentDays: 38,
    shift: 3,
    shiftDirection: "stable",
    monthsTracked: 20,
    totalInvoices: 48,
    totalAmount: 567000,
    action: "monitor",
    lastInvoiceDate: "2024-12-06",
  },
  {
    id: "11",
    name: "ElectroPro Installations",
    vatNumber: "BE0123.456.780",
    sector: "Electrical",
    historicalAvg: 18,
    currentDays: 32,
    shift: 14,
    shiftDirection: "worsening",
    monthsTracked: 11,
    totalInvoices: 22,
    totalAmount: 98000,
    action: "inform",
    lastInvoiceDate: "2024-11-25",
  },
  {
    id: "12",
    name: "SafeGuard Security",
    vatNumber: "BE0234.567.891",
    sector: "Security",
    historicalAvg: 10,
    currentDays: 8,
    shift: -2,
    shiftDirection: "improving",
    monthsTracked: 22,
    totalInvoices: 52,
    totalAmount: 234000,
    action: "monitor",
    lastInvoiceDate: "2024-12-07",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ActionBadge({ action }: { action: CompanyBehavior["action"] }) {
  switch (action) {
    case "monitor":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
          <CheckCircle className="h-3 w-3" />
          Monitor
        </Badge>
      );
    case "inform":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
          <Mail className="h-3 w-3" />
          Inform
        </Badge>
      );
    case "formal_notice":
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 gap-1">
          <FileWarning className="h-3 w-3" />
          Formal Notice
        </Badge>
      );
    case "escalate":
      return (
        <Badge variant="destructive" className="gap-1">
          <Scale className="h-3 w-3" />
          Escalate
        </Badge>
      );
  }
}

function ShiftIndicator({ shift, direction }: { shift: number; direction: string }) {
  if (direction === "improving") {
    return (
      <span className="flex items-center gap-1 text-emerald-600 font-medium font-mono text-sm">
        <TrendingDown className="h-3.5 w-3.5" />
        {shift}d
      </span>
    );
  }
  if (direction === "worsening") {
    return (
      <span className="flex items-center gap-1 text-red-600 font-medium font-mono text-sm">
        <TrendingUp className="h-3.5 w-3.5" />
        +{shift}d
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-muted-foreground font-mono text-sm">
      <Minus className="h-3.5 w-3.5" />
      {shift > 0 ? "+" : ""}{shift}d
    </span>
  );
}

export default function Register() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const filteredCompanies = demoCompanies.filter((company) => {
    const matchesSearch =
      !search ||
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.vatNumber.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === "all" || company.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const stats = {
    totalCompanies: demoCompanies.length,
    alerts: demoCompanies.filter((c) => c.action !== "monitor").length,
    escalations: demoCompanies.filter((c) => c.action === "escalate").length,
    totalExposure: demoCompanies.reduce((sum, c) => sum + c.totalAmount, 0),
    atRiskAmount: demoCompanies
      .filter((c) => c.action !== "monitor")
      .reduce((sum, c) => sum + c.totalAmount, 0),
  };

  const dueByAge = [
    { range: "<30d", count: demoCompanies.filter((c) => c.currentDays < 30).length, color: "#10b981" },
    { range: "30-45d", count: demoCompanies.filter((c) => c.currentDays >= 30 && c.currentDays < 45).length, color: "#f59e0b" },
    { range: "45-60d", count: demoCompanies.filter((c) => c.currentDays >= 45 && c.currentDays < 60).length, color: "#f97316" },
    { range: ">60d", count: demoCompanies.filter((c) => c.currentDays >= 60).length, color: "#ef4444" },
  ];

  const actionDistribution = [
    { name: "Monitor", value: demoCompanies.filter((c) => c.action === "monitor").length, color: "#10b981" },
    { name: "Inform", value: demoCompanies.filter((c) => c.action === "inform").length, color: "#f59e0b" },
    { name: "Formal Notice", value: demoCompanies.filter((c) => c.action === "formal_notice").length, color: "#f97316" },
    { name: "Escalate", value: demoCompanies.filter((c) => c.action === "escalate").length, color: "#ef4444" },
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">
            Payment Behavior Register
          </h1>
          <p className="text-sm text-muted-foreground">
            Track payment patterns and detect early warning signs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Companies</p>
            <p className="text-2xl font-bold text-blue-900 font-mono" data-testid="stat-total-companies">
              {stats.totalCompanies}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Alerts</p>
            <p className="text-2xl font-bold text-amber-900 font-mono" data-testid="stat-alerts">
              {stats.alerts}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardContent className="p-4">
            <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Escalations</p>
            <p className="text-2xl font-bold text-red-900 font-mono" data-testid="stat-escalations">
              {stats.escalations}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Exposure</p>
            <p className="text-2xl font-bold font-mono" data-testid="stat-total-exposure">
              {formatCurrency(stats.totalExposure)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="p-4">
            <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">At Risk</p>
            <p className="text-2xl font-bold text-orange-900 font-mono" data-testid="stat-at-risk">
              {formatCurrency(stats.atRiskAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-shrink-0" style={{ height: "140px" }}>
        <Card className="col-span-6 flex flex-col">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Payment Days Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dueByAge} layout="vertical">
                <XAxis type="number" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="range" type="category" fontSize={10} width={45} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {dueByAge.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 flex flex-col">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {actionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 flex flex-col">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Top Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 flex-1 overflow-hidden">
            <div className="space-y-1.5">
              {demoCompanies
                .filter((c) => c.action !== "monitor")
                .sort((a, b) => b.shift - a.shift)
                .slice(0, 3)
                .map((company) => (
                  <div key={company.id} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[100px]">{company.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                      +{company.shift}d
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company or VAT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
            data-testid="input-search"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40 h-9" data-testid="select-action-filter">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="monitor">Monitor</SelectItem>
            <SelectItem value="inform">Inform</SelectItem>
            <SelectItem value="formal_notice">Formal Notice</SelectItem>
            <SelectItem value="escalate">Escalate</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{filteredCompanies.length} companies</span>
        </div>
      </div>

      <Card className="flex-1 min-h-0 overflow-hidden">
        <CardContent className="p-0 h-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wide w-[200px]">Company</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide w-[120px]">VAT Number</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-center w-[80px]">Tracked</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-center w-[90px]">Hist. Avg</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-center w-[90px]">Current</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-center w-[80px]">Shift</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-right w-[100px]">Exposure</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide w-[130px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow
                  key={company.id}
                  className="cursor-pointer"
                  data-testid={`row-company-${company.id}`}
                >
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.sector}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {company.vatNumber}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs text-muted-foreground">{company.monthsTracked}m</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono text-sm font-medium">{company.historicalAvg}d</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`font-mono text-sm font-bold ${
                        company.currentDays > 45
                          ? "text-red-600"
                          : company.currentDays > 30
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {company.currentDays}d
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <ShiftIndicator shift={company.shift} direction={company.shiftDirection} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm">{formatCurrency(company.totalAmount)}</span>
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={company.action} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
