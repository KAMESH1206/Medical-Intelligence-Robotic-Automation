"use client";


import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  Lock,
  UserCheck,
  FileText,
  Clock,
  Sparkles,
  GitBranch,
} from "lucide-react";

export default function AuditLogsPage() {
  const { auditLogs } = useMiraStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resourceType && log.resourceType.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const exportCSV = () => {
    const headers = "Log ID,User Name,User ID,Action,Resource Type,Resource ID,Timestamp\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.userName}","${l.userId}","${l.action}","${l.resourceType || ""}","${l.resourceId || ""}","${l.timestamp}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mira_security_audit_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#25283A]">Security & Audit Trail</h2>
          <p className="text-xs text-[#74778A]">
            Immutable user action logs, AI execution provenance, access governance, and HIPAA/Privacy compliance.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DFDEEB] bg-white hover:bg-[#F8F8FC] text-xs font-medium text-[#25283A] transition"
        >
          <Download className="w-3.5 h-3.5 text-[#74778A]" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Security Compliance Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#248A63]">
            <Lock className="w-5 h-5 text-[#248A63]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#25283A]">Zero PHI Storage</div>
            <div className="text-[11px] text-[#74778A]">Synthetic data sandbox with automatic PII redaction</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#8DB9F0]/20 text-[#6BA3E8]">
            <UserCheck className="w-5 h-5 text-[#8DB9F0]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#25283A]">Role-Based Access Control</div>
            <div className="text-[11px] text-[#74778A]">Super Admin to Viewer permission tiering</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E9E8F8] text-[#25283A]">
            <Sparkles className="w-5 h-5 text-[#8DB9F0]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#25283A]">AI Execution Provenance</div>
            <div className="text-[11px] text-[#74778A]">Prompt inputs, versions, latency, and tokens logged</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#9699AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by user, action, resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mira-input mira-input-search text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#74778A]" />
          <span className="text-[#74778A]">Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="border border-[#DFDEEB] rounded-lg px-2.5 py-1.5 bg-[#F8F8FC] text-xs focus:outline-none focus:border-[#8DB9F0]"
          >
            <option value="all">All Actions</option>
            <option value="user_login">User Login</option>
            <option value="document_approved">Document Approved</option>
            <option value="ai_execution">AI Execution</option>
            <option value="workflow_executed">Workflow Executed</option>
            <option value="record_created">Record Created</option>
            <option value="record_updated">Record Updated</option>
            <option value="export_csv">Export CSV</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="mira-table">
            <thead>
              <tr>
                <th>Event Action</th>
                <th>Operator</th>
                <th>Target Resource</th>
                <th>Event Metadata</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className="font-mono text-xs font-bold text-[#25283A] px-2 py-0.5 rounded bg-[#E9E8F8]">
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="font-semibold text-xs text-[#25283A]">{log.userName}</div>
                    <div className="text-[10px] text-[#74778A] font-mono">{log.userId}</div>
                  </td>
                  <td>
                    <div className="text-xs text-[#25283A]">{log.resourceType || "System"}</div>
                    {log.resourceId && (
                      <div className="text-[10px] text-[#9699AA] font-mono">{log.resourceId}</div>
                    )}
                  </td>
                  <td>
                    {log.details ? (
                      <pre className="text-[10px] font-mono text-[#74778A] max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </pre>
                    ) : (
                      <span className="text-[11px] text-[#9699AA]">â€”</span>
                    )}
                  </td>
                  <td className="text-xs text-[#74778A] font-mono">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

