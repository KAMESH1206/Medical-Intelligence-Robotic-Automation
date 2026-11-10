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
          Configure API credentials, role-based governance, LLM provider routing, and demo environment reset.
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

      {/* Demo Environment Reset */}
      <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#25283A] flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Reset Demo Data</span>
          </h3>
          <p className="text-xs text-[#74778A] mt-0.5">
            Restores all 20 synthetic patients, 20 documents, 15 appointments, and validation rules to initial seed state.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset application data back to default synthetic demo state?")) {
              resetDemoData();
              alert("Data restored to initial synthetic demo state.");
            }
          }}
          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition"
        >
          Reset Dataset
        </button>
      </div>

      {/* Positioning Statement Card */}
      <div className="p-4 rounded-xl bg-[#E9E8F8]/40 border border-[#DFDEEB] flex items-start gap-3 text-xs text-[#74778A]">
        <Info className="w-4 h-4 text-[#8DB9F0] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#25283A]">Project Positioning & Independent Prototype Notice:</span>
          <p className="mt-0.5 leading-relaxed">
            MIRA Ops Intelligence is an independent healthcare technology prototype inspired by publicly described healthcare automation and administrative workflow challenges. It is not an official Gokul Infocare product and is developed to demonstrate practical AI engineering, Python automation, and modern full-stack SaaS architecture.
          </p>
        </div>
      </div>
    </div>
  );
}
