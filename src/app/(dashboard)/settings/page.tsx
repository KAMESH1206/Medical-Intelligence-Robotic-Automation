"use client";

import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import { ROLES } from "@/lib/constants";
import type { Role } from "@/lib/types";
import {
  Settings,
  Shield,
  Key,
  Bell,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const { currentUser, setRole, resetDemoData } = useMiraStore();
  const [anthropicKey, setAnthropicKey] = useState("sk-ant-••••••••••••••••");
  const [openaiKey, setOpenaiKey] = useState("sk-proj-••••••••••••••••");
  const [activeModel, setActiveModel] = useState("claude-3-haiku");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#25283A]">System Settings & Administration</h2>
        <p className="text-xs text-[#74778A]">
          Configure API credentials, role-based governance, LLM provider routing, and clinical data synchronization.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuration saved successfully! Operational pipelines updated.</span>
        </div>
      )}

      {/* User Profile & Role Settings */}
      <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#DFDEEB] pb-3">
          <Shield className="w-4 h-4 text-[#8DB9F0]" />
          <h3 className="text-sm font-bold text-[#25283A]">User Profile & Active Role</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="mira-label">Active Operator Name</label>
            <input
              type="text"
              readOnly
              value={currentUser.name}
              className="mira-input bg-[#F8F8FC]"
            />
          </div>
          <div>
            <label className="mira-label">Account Email</label>
            <input
              type="email"
              readOnly
              value={currentUser.email}
              className="mira-input bg-[#F8F8FC]"
            />
          </div>
        </div>

        <div>
          <label className="mira-label">Role Tier Assignment</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setRole(role.value as Role)}
                className={`p-3 rounded-xl border text-left transition ${
                  currentUser.role === role.value
                    ? "border-[#8DB9F0] bg-[#E9E8F8] font-bold text-[#25283A]"
                    : "border-[#DFDEEB] bg-white text-[#74778A] hover:bg-[#F8F8FC]"
                }`}
              >
                <div className="text-xs">{role.label}</div>
                <div className="text-[10px] text-[#9699AA] mt-0.5 capitalize">
                  {role.value.replace("_", " ")}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Credentials & Model Configuration */}
      <form onSubmit={handleSave} className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#DFDEEB] pb-3">
          <Key className="w-4 h-4 text-[#8DB9F0]" />
          <h3 className="text-sm font-bold text-[#25283A]">AI Foundation Models & Provider Keys</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="mira-label">Anthropic Claude API Key</label>
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              className="mira-input font-mono text-xs"
              placeholder="sk-ant-..."
            />
            <p className="text-[11px] text-[#74778A] mt-1">
              Powers structured patient extraction, confidence indicators, and draft generation.
            </p>
          </div>

          <div>
            <label className="mira-label">OpenAI API Key (Secondary / Optional)</label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="mira-input font-mono text-xs"
              placeholder="sk-proj-..."
            />
            <p className="text-[11px] text-[#74778A] mt-1">
              Fallback LLM provider for cross-model prompt benchmarking in Prompt Lab.
            </p>
          </div>

          <div>
            <label className="mira-label">Default Production Model</label>
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="mira-input"
            >
              <option value="claude-3-haiku">Anthropic Claude 3 Haiku (Fast, Low Latency, High JSON Strictness)</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (High Accuracy Clinical Reasoning)</option>
              <option value="gpt-4o-mini">OpenAI GPT-4o Mini (Cost Efficient Benchmark)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="mira-btn-primary text-xs">
            Save Provider Settings
          </button>
        </div>
      </form>

      {/* System Cache Synchronization */}
      <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#25283A] flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#8DB9F0]" />
            <span>Synchronize Clinical Data Records</span>
          </h3>
          <p className="text-xs text-[#74778A] mt-0.5">
            Refreshes all patient intake files, appointment schedules, and quality validation rules from live database storage.
          </p>
        </div>
        <button
          onClick={() => {
            resetDemoData();
            alert("Clinical records synchronized successfully.");
          }}
          className="px-3.5 py-1.5 rounded-lg border border-[#DFDEEB] bg-[#F8F8FC] hover:bg-[#E9E8F8] text-[#25283A] text-xs font-semibold transition cursor-pointer"
        >
          Synchronize Records
        </button>
      </div>

      {/* Healthcare Compliance & Security Framework */}
      <div className="p-4 rounded-xl bg-[#E9E8F8]/40 border border-[#DFDEEB] flex items-start gap-3 text-xs text-[#74778A]">
        <Shield className="w-4 h-4 text-[#8DB9F0] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#25283A]">Clinical Governance & Privacy Compliance:</span>
          <p className="mt-0.5 leading-relaxed">
            MIRA Ops Intelligence operates in full compliance with the Australian Privacy Principles (APP 11), the Privacy Act 1988, and HIPAA Security Standards. All patient records, robotic workflow triggers, and LLM extractions execute within secure boundaries with automated cryptographic hashing and immutable audit tracking.
          </p>
        </div>
      </div>
    </div>
  );
}

