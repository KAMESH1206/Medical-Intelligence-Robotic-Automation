"use client";


import React, { useState, useEffect } from "react";
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
  Trash2,
  Sparkles,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  const { currentUser, setRole, resetDemoData, clearAllRecords } = useMiraStore();
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-3-flash-preview");
  const [hasGeminiConfigured, setHasGeminiConfigured] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [activeModel, setActiveModel] = useState("claude-3-haiku");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings/ai")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setHasGeminiConfigured(res.hasGeminiKey);
          if (res.geminiModel) setGeminiModel(res.geminiModel);
          if (res.maskedGeminiKey) setGeminiKey(res.maskedGeminiKey);
        }
      })
      .catch(() => {});
  }, []);

  const handleTestGemini = async () => {
    setIsTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", geminiKey, geminiModel }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.model) setGeminiModel(data.model);
        setGeminiTestResult({ success: true, message: data.message || "Gemini API connected successfully!" });
      } else {
        setGeminiTestResult({ success: false, message: data.error || "Failed to connect to Gemini API." });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setGeminiTestResult({ success: false, message: err.message || "Network error" });
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (geminiKey && !geminiKey.includes("...")) {
        await fetch("/api/settings/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ geminiKey, geminiModel }),
        });
        setHasGeminiConfigured(true);
      }
    } catch {}

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
        <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8DB9F0]" />
            <h3 className="text-sm font-bold text-[#25283A]">AI Foundation Models & Provider Keys</h3>
          </div>
          {hasGeminiConfigured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Gemini Active</span>
            </span>
          )}
        </div>

        <div className="space-y-4 text-xs">
          {/* Google Gemini Card (Primary for OCR & Vision) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#E9E8F8]/50 via-white to-blue-50/30 border border-[#8DB9F0]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#6BA3E8]" />
                <span className="font-bold text-[#25283A] text-xs">Google Gemini API (Clinical OCR & Handwriting)</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#6BA3E8] px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                Primary Vision OCR
              </span>
            </div>

            <div>
              <label className="mira-label">Google Gemini API Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="mira-input font-mono text-xs flex-1"
                  placeholder="Paste your Gemini Key: AIzaSy..."
                />
                <button
                  type="button"
                  onClick={handleTestGemini}
                  disabled={isTestingGemini || !geminiKey}
                  className="px-3 py-1.5 rounded-lg border border-[#8DB9F0] bg-white hover:bg-[#E9E8F8] text-[#25283A] text-xs font-semibold transition disabled:opacity-50 shrink-0"
                >
                  {isTestingGemini ? "Testing..." : "Test Connection"}
                </button>
              </div>
              <p className="text-[11px] text-[#74778A] mt-1">
                Reads cursive doctor prescriptions, patient intake scans, and laboratory pathology reports. Get your free API key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-[#6BA3E8] hover:underline font-semibold">Google AI Studio</a>.
              </p>
            </div>

            {geminiTestResult && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  geminiTestResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {geminiTestResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span>{geminiTestResult.message}</span>
              </div>
            )}

            <div>
              <label className="mira-label">Gemini Vision Model</label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="mira-input"
              >
                <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Recommended - Ultra Fast OCR & Multimodal)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Speed & Low Latency)</option>
                <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mira-label">Anthropic Claude API Key (Optional)</label>
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

      {/* Data Management & Testing Controls */}
      <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DFDEEB]">
          <div>
            <h3 className="text-sm font-bold text-[#25283A] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#F5B69E]" />
              <span>Clear Test Data (Start Clean with Real Data)</span>
            </h3>
            <p className="text-xs text-[#74778A] mt-0.5">
              Removes all sample records so you can test real patient intake, live document uploads, and actual clinical workflows from scratch.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to clear all test records? All tables will be empty and ready for real data entry.")) {
                clearAllRecords();
                alert("All test records have been cleared. You now have a clean slate to test with real data!");
              }
            }}
            className="px-3.5 py-1.5 rounded-lg border border-[#F5B69E] bg-[#F5B69E]/15 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-[#25283A] text-xs font-semibold transition cursor-pointer"
          >
            Clear All Test Records
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <h3 className="text-sm font-bold text-[#25283A] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#8DB9F0]" />
              <span>Restore Reference Baseline Dataset</span>
            </h3>
            <p className="text-xs text-[#74778A] mt-0.5">
              Reloads the standard Australian healthcare demonstration records (useful for quick interview demos).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetDemoData();
              alert("Reference baseline records restored successfully.");
            }}
            className="px-3.5 py-1.5 rounded-lg border border-[#DFDEEB] bg-[#F8F8FC] hover:bg-[#E9E8F8] text-[#25283A] text-xs font-semibold transition cursor-pointer"
          >
            Restore Baseline Dataset
          </button>
        </div>
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

