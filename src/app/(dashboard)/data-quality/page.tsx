"use client";

import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import {
  ShieldCheck,
  AlertTriangle,
  Copy,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  Filter,
  ArrowRight,
} from "lucide-react";

export default function DataQualityPage() {
  const {
    patients,
    validationIssues,
    resolveValidationIssue,
    duplicateCandidates,
    resolveDuplicate,
  } = useMiraStore();

  const [activeTab, setActiveTab] = useState<"issues" | "duplicates">("issues");
  const [selectedDuplicate, setSelectedDuplicate] = useState<any | null>(null);

  const totalRecords = patients.length;
  const invalidRecords = validationIssues.length;
  const validRecords = Math.max(0, totalRecords - invalidRecords);
  const duplicatesPending = duplicateCandidates.filter((d) => d.status === "pending").length;

  const exportQualityReport = () => {
    const headers = "Issue ID,Record Type,Field,Severity,Issue Description\n";
    const rows = validationIssues
      .map(
        (i) =>
          `"${i.id}","${i.recordType}","${i.field}","${i.severity}","${i.issue}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mira_data_quality_report_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#25283A]">Healthcare Data Quality Engine</h2>
          <p className="text-xs text-[#74778A]">
            Continuous validation rules, duplicate record clustering, format normalization, and human resolution.
          </p>
        </div>
        <button
          onClick={exportQualityReport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DFDEEB] bg-white hover:bg-[#F8F8FC] text-xs font-medium text-[#25283A] transition"
        >
          <Download className="w-3.5 h-3.5 text-[#74778A]" />
          <span>Export Quality Report</span>
        </button>
      </div>

      {/* Summary Quality Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs">
          <div className="text-[11px] font-semibold text-[#74778A] uppercase tracking-wider">
            Total Audited Records
          </div>
          <div className="text-2xl font-bold text-[#25283A] mt-1">{totalRecords}</div>
          <div className="text-[11px] text-[#248A63] mt-1">100% active integrity scan</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs">
          <div className="text-[11px] font-semibold text-[#74778A] uppercase tracking-wider">
            Valid & Compliant
          </div>
          <div className="text-2xl font-bold text-[#248A63] mt-1">{validRecords}</div>
          <div className="text-[11px] text-[#74778A] mt-1">
            {Math.round((validRecords / (totalRecords || 1)) * 100)}% compliance rate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#F5B69E]/40 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74778A] uppercase tracking-wider">
            Validation Errors
          </div>
          <div className="text-2xl font-bold text-[#D65B62] mt-1">{invalidRecords}</div>
          <div className="text-[11px] text-[#D65B62] mt-1">Missing fields / invalid formats</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74778A] uppercase tracking-wider">
            Duplicate Candidates
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{duplicatesPending}</div>
          <div className="text-[11px] text-amber-600 mt-1">Requires human review</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DFDEEB] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("issues")}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === "issues"
              ? "bg-[#8DB9F0] text-white"
              : "text-[#74778A] hover:bg-[#E9E8F8]"
          }`}
        >
          Validation Issues ({validationIssues.length})
        </button>
        <button
          onClick={() => setActiveTab("duplicates")}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === "duplicates"
              ? "bg-[#8DB9F0] text-white"
              : "text-[#74778A] hover:bg-[#E9E8F8]"
          }`}
        >
          Duplicate Candidates ({duplicateCandidates.length})
        </button>
      </div>

      {/* Tab 1: Validation Issues */}
      {activeTab === "issues" && (
        <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
          <table className="mira-table">
            <thead>
              <tr>
                <th>Record Target</th>
                <th>Target Field</th>
                <th>Validation Issue Description</th>
                <th>Severity</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {validationIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#248A63] font-semibold">
                    ✓ All records currently pass data quality rules!
                  </td>
                </tr>
              ) : (
                validationIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <span className="font-mono text-xs text-[#25283A] font-semibold">
                        {issue.recordId}
                      </span>
                      <div className="text-[10px] text-[#74778A] uppercase font-bold">
                        {issue.recordType}
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded bg-[#E9E8F8] text-[11px] font-mono text-[#25283A]">
                        {issue.field}
                      </span>
                    </td>
                    <td className="text-xs text-[#74778A]">{issue.issue}</td>
                    <td>
                      <span
                        className={`mira-badge ${
                          issue.severity === "error"
                            ? "mira-badge-red"
                            : issue.severity === "warning"
                            ? "mira-badge-peach"
                            : "mira-badge-blue"
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => resolveValidationIssue(issue.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition"
                      >
                        Mark Resolved
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Duplicate Candidates */}
      {activeTab === "duplicates" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
            <table className="mira-table">
              <thead>
                <tr>
                  <th>Primary Record</th>
                  <th>Candidate Duplicate</th>
                  <th>Similarity Match</th>
                  <th>Matching Criteria</th>
                  <th>Status</th>
                  <th className="text-right">Resolve</th>
                </tr>
              </thead>
              <tbody>
                {duplicateCandidates.map((dup) => (
                  <tr key={dup.id}>
                    <td className="font-semibold text-xs text-[#25283A]">{dup.record1Name}</td>
                    <td className="font-semibold text-xs text-[#74778A]">{dup.record2Name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-2 rounded-full bg-[#E9E8F8] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#F5B69E]"
                            style={{ width: `${dup.similarityScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#EE9478]">
                          {dup.similarityScore}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {dup.matchFields.map((f) => (
                          <span
                            key={f}
                            className="px-1.5 py-0.5 rounded bg-[#F8F8FC] border border-[#DFDEEB] text-[10px] text-[#74778A]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`mira-badge ${
                          dup.status === "confirmed_duplicate"
                            ? "mira-badge-red"
                            : dup.status === "not_duplicate"
                            ? "mira-badge-green"
                            : "mira-badge-yellow"
                        }`}
                      >
                        {dup.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="text-right">
                      {dup.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => resolveDuplicate(dup.id, "confirmed_duplicate")}
                            className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition"
                            title="Confirm as duplicate"
                          >
                            Confirm Duplicate
                          </button>
                          <button
                            onClick={() => resolveDuplicate(dup.id, "not_duplicate")}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition"
                            title="Distinct patient"
                          >
                            Not Duplicate
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#9699AA] italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 rounded-xl bg-[#E9E8F8]/40 border border-[#DFDEEB] text-xs text-[#74778A]">
            <span className="font-semibold text-[#25283A]">Healthcare Privacy Compliance Notice:</span> Duplicate records are never auto-merged without explicit clinical/administrative authorization, ensuring patient safety and record continuity.
          </div>
        </div>
      )}
    </div>
  );
}

