"use client";

export const instant = false;

import React from "react";
import { useMiraStore } from "@/lib/store";
import {
  Users,
  FileCheck2,
  ShieldAlert,
  CalendarClock,
  Sparkles,
  GitBranch,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const {
    patients,
    documents,
    appointments,
    validationIssues,
    duplicateCandidates,
    workflows,
    auditLogs,
  } = useMiraStore();

  const totalPatients = patients.length;
  const docsProcessed = documents.filter((d) => d.status === "completed").length;
  const pendingReviews = documents.filter((d) => d.status === "needs_review").length + validationIssues.length;
  const duplicateCount = duplicateCandidates.filter((d) => d.status === "pending").length;
  const appointmentRequests = appointments.filter((a) => a.status === "requested" || a.status === "pending_approval").length;
  const totalExecutions = workflows.reduce((acc, w) => acc + w.totalExecutions, 0);
  const successfulExecutions = workflows.reduce((acc, w) => acc + w.successfulExecutions, 0);
  const failedExecutions = Math.max(0, totalExecutions - successfulExecutions);

  const kpis = [
    {
      label: "Patient Enquiries",
      value: totalPatients,
      icon: Users,
      trend: "+12% this week",
      color: "bg-[#8DB9F0]/15 text-[#6BA3E8]",
      border: "border-[#8DB9F0]/30",
    },
    {
      label: "Documents Processed",
      value: docsProcessed,
      icon: FileCheck2,
      trend: "98.4% OCR precision",
      color: "bg-[#E9E8F8] text-[#25283A]",
      border: "border-[#DFDEEB]",
    },
    {
      label: "Pending Reviews",
      value: pendingReviews,
      icon: AlertTriangle,
      trend: "Requires human review",
      color: "bg-[#F5B69E]/20 text-[#EE9478]",
      border: "border-[#F5B69E]/40",
    },
    {
      label: "Duplicate Candidates",
      value: duplicateCount,
      icon: ShieldAlert,
      trend: "Similarity >= 80%",
      color: "bg-amber-50 text-amber-600",
      border: "border-amber-200",
    },
    {
      label: "Appointment Requests",
      value: appointmentRequests,
      icon: CalendarClock,
      trend: "5 awaiting approval",
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-200",
    },
    {
      label: "Automations Executed",
      value: totalExecutions,
      icon: GitBranch,
      trend: `${successfulExecutions} succeeded (${Math.round((successfulExecutions / (totalExecutions || 1)) * 100)}%)`,
      color: "bg-purple-50 text-purple-600",
      border: "border-purple-200",
    },
  ];

  // Daily Enquiry Trends data
  const trendData = [
    { day: "Mon", enquiries: 18, documents: 14, automated: 12 },
    { day: "Tue", enquiries: 24, documents: 19, automated: 16 },
    { day: "Wed", enquiries: 22, documents: 18, automated: 15 },
    { day: "Thu", enquiries: 31, documents: 26, automated: 23 },
    { day: "Fri", enquiries: 28, documents: 22, automated: 19 },
    { day: "Sat", enquiries: 12, documents: 9, automated: 7 },
    { day: "Sun", enquiries: 15, documents: 11, automated: 9 },
  ];

  // Automation breakdown
  const automationPie = [
    { name: "Successful", value: successfulExecutions, color: "#8DB9F0" },
    { name: "Needs Review", value: pendingReviews, color: "#F5B69E" },
    { name: "Failed / Error", value: Math.max(1, failedExecutions), color: "#D65B62" },
  ];

  // Document types
  const docTypeData = [
    { type: "Referrals", count: 9 },
    { type: "Intake Forms", count: 5 },
    { type: "Pathology", count: 3 },
    { type: "Prescriptions", count: 2 },
    { type: "Other", count: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#E9E8F8]/60 via-white to-[#F5B69E]/15 border border-[#DFDEEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8DB9F0]/25 text-[#25283A]">
              Live Healthcare Ops
            </span>
            <span className="text-xs text-[#74778A]">Australian Healthcare Standard</span>
          </div>
          <h2 className="text-xl font-bold text-[#25283A]">
            Operations Command Center
          </h2>
          <p className="text-xs text-[#74778A] mt-0.5 max-w-2xl">
            Real-time monitoring of AI patient intake, OCR document intelligence, robotic workflow executions, and data quality metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-[#25283A]">System Health</div>
            <div className="text-[11px] text-[#248A63] font-medium flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#248A63]" /> 99.8% Automation Accuracy
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl bg-white border ${kpi.border} shadow-xs hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#74778A] uppercase tracking-wider truncate">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#25283A]">{kpi.value}</div>
              <div className="text-[11px] text-[#74778A] mt-1 truncate">
                {kpi.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#25283A]">Enquiry & Document Intake Flow</h3>
              <p className="text-xs text-[#74778A]">Daily volume comparing intake versus automated processing</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#25283A] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8DB9F0]"></span> Enquiries
              </span>
              <span className="flex items-center gap-1.5 text-[#25283A] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5B69E]"></span> Automated
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8DB9F0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8DB9F0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAutomated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5B69E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F5B69E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#9699AA" fontSize={11} tickLine={false} />
                <YAxis stroke="#9699AA" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #DFDEEB",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  stroke="#8DB9F0"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnquiries)"
                />
                <Area
                  type="monotone"
                  dataKey="automated"
                  stroke="#F5B69E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAutomated)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Automation Execution Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-[#25283A]">Automation Health</h3>
            <p className="text-xs text-[#74778A]">Execution resolution ratio</p>
          </div>
          <div className="flex-1 flex items-center justify-center h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={automationPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {automationPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-[#DFDEEB] text-xs">
            {automationPie.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#74778A]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold text-[#25283A]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Document Types Bar & Recent Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Intake Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-[#25283A]">Documents by Category</h3>
            <p className="text-xs text-[#74778A]">Classification distribution</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docTypeData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" stroke="#9699AA" fontSize={10} tickLine={false} />
                <YAxis dataKey="type" type="category" stroke="#9699AA" fontSize={11} width={80} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8DB9F0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Operational Activity Logs */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#25283A]">Real-Time Audit Trail</h3>
              <p className="text-xs text-[#74778A]">Latest validated system events</p>
            </div>
            <span className="text-xs text-[#6BA3E8] font-semibold cursor-pointer hover:underline">
              View All ({auditLogs.length})
            </span>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-56 pr-1">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-2.5 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#8DB9F0] mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-[#25283A]">
                      {log.action.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div className="text-[#74778A] text-[11px]">
                      By {log.userName} · {log.resourceType ? `${log.resourceType} (${log.resourceId || "id"})` : "System Action"}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-[#9699AA] shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

