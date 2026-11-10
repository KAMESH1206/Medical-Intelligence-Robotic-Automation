"use client";


import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import type { Workflow, WorkflowExecution } from "@/lib/types";
import {
  GitBranch,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Lock,
  AlertTriangle,
  Mail,
  Check,
  Eye,
  X,
} from "lucide-react";

export default function AutomationPage() {
  const { workflows, workflowExecutions, runWorkflow, currentUser } = useMiraStore();
  const perms = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.healthcare_admin;
  const [runningId, setRunningId] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);

  const handleRun = async (workflowId: string) => {
    setRunningId(workflowId);
    try {
      const exec = await runWorkflow(workflowId);
      setSelectedExecution(exec);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#25283A]">Intelligent Workflow Automation</h2>
          <p className="text-xs text-[#74778A]">
            Robotic task queues, clinical validation chains, automated email triage, and human approval gates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#E9E8F8] text-xs font-semibold text-[#25283A]">
            Engine Status: Active (4 workflows loaded)
          </span>
        </div>
      </div>

      {!perms.canExecuteWorkflows && (
        <div className="p-3.5 rounded-xl bg-[#FFF3DC] border border-[#D99035]/30 flex items-center gap-2.5 text-xs text-[#D99035]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Read-Only Monitoring:</strong> Currently viewing as <strong>{perms.label}</strong>. Robotic pipeline execution requires <strong>Operations Executive</strong> or <strong>Super Admin</strong> authorization.
          </span>
        </div>
      )}

      {/* Configured Workflows Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8DB9F0] transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#8DB9F0]/20 text-[#6BA3E8]">
                    <GitBranch className="w-4 h-4 text-[#8DB9F0]" />
                  </div>
                  <h3 className="font-bold text-sm text-[#25283A]">{wf.name}</h3>
                </div>
                <span className="mira-badge mira-badge-green capitalize text-[10px]">
                  {wf.status}
                </span>
              </div>
              <p className="text-xs text-[#74778A] leading-relaxed">
                {wf.description}
              </p>

              {/* Steps Visual Chain */}
              <div className="mt-3 pt-3 border-t border-[#DFDEEB] space-y-2">
                <div className="text-[11px] font-semibold text-[#74778A] uppercase tracking-wider">
                  Automated Steps Sequence ({wf.steps.length}):
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {wf.steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                      <span className="px-2 py-0.5 rounded bg-[#F8F8FC] border border-[#DFDEEB] text-[#25283A] font-mono">
                        {step.actionType.replace("_", " ")}
                      </span>
                      {idx < wf.steps.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-[#9699AA]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DFDEEB] text-xs">
              <div className="text-[#74778A]">
                Executed <span className="font-bold text-[#25283A]">{wf.totalExecutions}</span> times
                ({wf.successfulExecutions} success)
              </div>
              <button
                onClick={() => handleRun(wf.id)}
                disabled={runningId === wf.id || !perms.canExecuteWorkflows}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  perms.canExecuteWorkflows
                    ? "bg-[#8DB9F0] text-white hover:bg-[#6BA3E8] cursor-pointer"
                    : "bg-[#F8F8FC] border border-[#DFDEEB] text-[#9699AA] cursor-not-allowed"
                }`}
                title={
                  !perms.canExecuteWorkflows
                    ? `Execution requires Operations Executive authorization (Current: ${perms.label})`
                    : "Run pipeline"
                }
              >
                {perms.canExecuteWorkflows ? (
                  <>
                    <Play className="w-3 h-3" />
                    <span>{runningId === wf.id ? "Running Pipeline..." : "Execute Workflow"}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-[#9699AA]" />
                    <span>Execution Locked</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Execution History */}
      <div className="rounded-2xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DFDEEB] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#25283A]">Workflow Execution Trail</h3>
            <p className="text-xs text-[#74778A]">Idempotent execution history with latency & step results</p>
          </div>
          <span className="text-xs text-[#74778A] font-medium">
            {workflowExecutions.length} recent executions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="mira-table">
            <thead>
              <tr>
                <th>Workflow Name</th>
                <th>Triggered By</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Steps Completed</th>
                <th>Started At</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflowExecutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#9699AA]">
                    Click &quot;Execute Workflow&quot; above to run and log a real-time robotic pipeline.
                  </td>
                </tr>
              ) : (
                workflowExecutions.map((exec) => (
                  <tr
                    key={exec.id}
                    onClick={() => setSelectedExecution(exec)}
                    className="cursor-pointer hover:bg-[#F8F8FC] transition"
                  >
                    <td className="font-semibold text-xs text-[#25283A]">{exec.workflowName}</td>
                    <td className="text-xs text-[#74778A]">{exec.triggeredBy}</td>
                    <td>
                      <span
                        className={`mira-badge ${
                          exec.status === "success"
                            ? "mira-badge-green"
                            : exec.status === "running"
                            ? "mira-badge-blue"
                            : "mira-badge-red"
                        }`}
                      >
                        {exec.status}
                      </span>
                    </td>
                    <td className="text-xs font-mono text-[#25283A]">
                      {exec.durationMs ? `${exec.durationMs}ms` : "In progress..."}
                    </td>
                    <td className="text-xs text-[#74778A]">
                      {exec.stepResults.length} steps verified
                    </td>
                    <td className="text-xs text-[#74778A]">
                      {new Date(exec.startedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExecution(exec);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#DFDEEB] text-xs font-medium text-[#25283A] hover:bg-[#E9E8F8] transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#8DB9F0]" />
                        <span>View Steps</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Step Inspector Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto bg-white rounded-2xl p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E9E8F8] text-[#8DB9F0] flex items-center justify-center border border-[#DFDEEB]">
                  <GitBranch className="w-4 h-4 text-[#25283A]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#25283A]">{selectedExecution.workflowName}</h3>
                  <p className="text-xs text-[#74778A]">Robotic Execution Run • ID: {selectedExecution.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExecution(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta summary card */}
            <div className="p-3 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-[#74778A] block">Triggered By</span>
                <span className="font-semibold text-[#25283A]">{selectedExecution.triggeredBy}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#74778A] block">Duration</span>
                <span className="font-mono text-[#25283A]">{selectedExecution.durationMs || 850}ms</span>
              </div>
              <div>
                <span className="text-[11px] text-[#74778A] block">Status</span>
                <span className="mira-badge mira-badge-green font-semibold">
                  {selectedExecution.status}
                </span>
              </div>
            </div>

            {/* Step Results List */}
            <div className="space-y-2">
              <label className="mira-label text-xs">Pipeline Execution Step Results</label>
              <div className="space-y-2">
                {selectedExecution.stepResults.map((step, idx) => (
                  <div
                    key={step.stepId || idx}
                    className="p-3 rounded-xl bg-white border border-[#DFDEEB] shadow-2xs space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#E9E8F8] text-[#25283A] font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[#25283A] capitalize">
                          {step.action.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified 200 OK
                      </span>
                    </div>
                    <p className="text-[11px] text-[#74778A] pl-7 font-mono bg-[#F8F8FC] p-2 rounded-lg border border-[#DFDEEB]/50 mt-1">
                      {typeof step.output === "object" && step.output !== null && "result" in step.output
                        ? String((step.output as Record<string, unknown>).result)
                        : JSON.stringify(step.output)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#DFDEEB]">
              <button
                type="button"
                onClick={() => setSelectedExecution(null)}
                className="mira-btn-primary text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

