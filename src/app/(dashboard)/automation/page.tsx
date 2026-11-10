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
              </tr>
            </thead>
            <tbody>
              {workflowExecutions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#9699AA]">
                    Click &quot;Execute Workflow&quot; above to run and log a real-time robotic pipeline.
                  </td>
                </tr>
              ) : (
                workflowExecutions.map((exec) => (
                  <tr key={exec.id}>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

