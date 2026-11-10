"use client";


import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function AnalyticsPage() {
  const { patients, documents, appointments, workflows } = useMiraStore();
  const [reportType, setReportType] = useState("daily_ops");

  // Weekly operational breakdown
  const weeklyData = [
    { day: "Mon", enquiries: 12, documents: 8, appointments: 5, accuracy: 98 },
    { day: "Tue", enquiries: 19, documents: 14, appointments: 8, accuracy: 97 },
    { day: "Wed", enquiries: 15, documents: 11, appointments: 6, accuracy: 99 },
    { day: "Thu", enquiries: 22, documents: 16, appointments: 11, accuracy: 98 },
    { day: "Fri", enquiries: 26, documents: 20, appointments: 13, accuracy: 99 },
    { day: "Sat", enquiries: 9, documents: 5, appointments: 3, accuracy: 100 },
    { day: "Sun", enquiries: 11, documents: 7, appointments: 4, accuracy: 98 },
  ];

  const exportCSV = () => {
    const headers = "Day,Enquiries,Documents Processed,Appointments Created,Accuracy (%)\n";
    const rows = weeklyData
      .map((d) => `"${d.day}","${d.enquiries}","${d.documents}","${d.appointments}","${d.accuracy}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mira_analytics_report_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#25283A]">Operations Analytics & Reporting</h2>
          <p className="text-xs text-[#74778A]">
            Quantitative operational reports, document conversion metrics, and throughput analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DFDEEB] bg-white hover:bg-[#F8F8FC] text-xs font-medium text-[#25283A] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#74778A]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#74778A]" />
          <span className="text-[#74778A]">Report Type:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-[#DFDEEB] rounded-lg px-2.5 py-1.5 bg-[#F8F8FC] text-xs focus:outline-none focus:border-[#8DB9F0]"
          >
            <option value="daily_ops">Daily Operations Summary</option>
            <option value="doc_pipeline">Document Pipeline Performance</option>
            <option value="data_integrity">Data Quality & Validation Trends</option>
            <option value="appointment_turnaround">Appointment Scheduling Latency</option>
          </select>
        </div>

        <div className="text-xs text-[#74778A]">
          Period: <span className="font-semibold text-[#25283A]">Last 7 Days (Consolidated)</span>
        </div>
      </div>

      {/* Primary Throughput Chart */}
      <div className="p-6 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#25283A]">Cross-Department Administrative Throughput</h3>
            <p className="text-xs text-[#74778A]">Daily volume across patient intake, OCR scanning, and appointment bookings</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#25283A]">
              <span className="w-3 h-3 rounded-sm bg-[#8DB9F0]"></span> Enquiries
            </span>
            <span className="flex items-center gap-1.5 text-[#25283A]">
              <span className="w-3 h-3 rounded-sm bg-[#E9E8F8] border border-[#DFDEEB]"></span> Documents
            </span>
            <span className="flex items-center gap-1.5 text-[#25283A]">
              <span className="w-3 h-3 rounded-sm bg-[#F5B69E]"></span> Appointments
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F5" />
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
              <Bar dataKey="enquiries" fill="#8DB9F0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="documents" fill="#C5DBFA" radius={[4, 4, 0, 0]} />
              <Bar dataKey="appointments" fill="#F5B69E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy & Integrity Line Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs">
          <h3 className="text-sm font-bold text-[#25283A] mb-1">AI Extraction Accuracy Curve</h3>
          <p className="text-xs text-[#74778A] mb-4">Percentage of fields requiring zero human manual correction</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F5" />
                <XAxis dataKey="day" stroke="#9699AA" fontSize={11} tickLine={false} />
                <YAxis domain={[90, 100]} stroke="#9699AA" fontSize={11} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#248A63"
                  strokeWidth={2.5}
                  dot={{ fill: "#248A63", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational KPI Summary */}
        <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#25283A] mb-1">Operations KPI Benchmark</h3>
            <p className="text-xs text-[#74778A] mb-4">Calculated against Australian healthcare administrative targets</p>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-[#25283A] mb-1">
                  <span>Intake-to-Record Speed</span>
                  <span className="text-[#248A63]">1.2s avg (Target &lt; 5s)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E9E8F8] overflow-hidden">
                  <div className="w-[90%] h-full bg-[#8DB9F0] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#25283A] mb-1">
                  <span>OCR Confidence Benchmark</span>
                  <span className="text-[#248A63]">94.2% (Target &gt; 85%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E9E8F8] overflow-hidden">
                  <div className="w-[94%] h-full bg-[#248A63] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[#25283A] mb-1">
                  <span>Duplicate Detection Recall</span>
                  <span className="text-[#248A63]">98.0% (Target &gt; 95%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E9E8F8] overflow-hidden">
                  <div className="w-[98%] h-full bg-[#F5B69E] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DFDEEB] text-[11px] text-[#74778A] flex items-center justify-between">
            <span>Audit Standard: ISO/IEC 27001 Aligned</span>
            <span className="text-[#248A63] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All SLA Met
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

