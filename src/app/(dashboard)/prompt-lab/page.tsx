"use client";

import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  BarChart2,
  Code2,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const SAMPLE_TEST_CASES = [
  {
    title: "Standard Complete Intake",
    text: "Patient Emma Watson born 12/04/1988, contact 0412 345 678, emma@example.com. Booking for routine checkup at Sydney Central Clinic.",
  },
  {
    title: "Missing Fields (No phone or email)",
    text: "Hi this is Oliver Brown. Need to book a specialist review at Adelaide Care Centre as soon as possible.",
  },
  {
    title: "Messy Unstructured Text",
    text: "urgent request!! need doctor visit Melbourne Health Hub tomorrow. my name is Sophia Martinez, email is sophia@test.com but don't call me today.",
  },
];

export default function PromptLabPage() {
  const { promptVersions, promptExecutions, runPromptTest } = useMiraStore();
  const [selectedPromptId, setSelectedPromptId] = useState(promptVersions[2].id);
  const [testInput, setTestInput] = useState(SAMPLE_TEST_CASES[0].text);
  const [isRunning, setIsRunning] = useState(false);
  const [latestResult, setLatestResult] = useState<any | null>(null);

  const activePrompt = promptVersions.find((p) => p.id === selectedPromptId) || promptVersions[2];

  // Benchmark Comparison Metrics
  const benchmarkData = [
    {
      version: "v1: Basic",
      jsonValidity: 20,
      fieldAccuracy: 50,
      uncertaintyHandling: 0,
      latencyMs: 620,
      costPer1k: 0.0015,
    },
    {
      version: "v2: JSON Schema",
      jsonValidity: 92,
      fieldAccuracy: 84,
      uncertaintyHandling: 50,
      latencyMs: 780,
      costPer1k: 0.0025,
    },
    {
      version: "v3: Enterprise",
      jsonValidity: 99.8,
      fieldAccuracy: 97.4,
      uncertaintyHandling: 96,
      latencyMs: 910,
      costPer1k: 0.0038,
    },
  ];

  const handleExecuteTest = async () => {
    setIsRunning(true);
    try {
      const res = await runPromptTest(selectedPromptId, testInput);
      setLatestResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#25283A]">Prompt Engineering Evaluation Lab</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5B69E]/30 text-[#EE9478]">
              Assessment Benchmark
            </span>
          </div>
          <p className="text-xs text-[#74778A]">
            Empirical comparative analysis across Prompt V1 (Naive), Prompt V2 (Schema JSON), and Prompt V3 (Confidence Guardrails).
          </p>
        </div>
      </div>

      {/* Benchmark Summary Comparative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promptVersions.map((pv) => {
          const isSelected = pv.id === selectedPromptId;
          const bm = benchmarkData.find((b) => b.version.startsWith(`v${pv.version}`));
          return (
            <div
              key={pv.id}
              onClick={() => setSelectedPromptId(pv.id)}
              className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-xs flex flex-col justify-between ${
                isSelected
                  ? "border-[#8DB9F0] ring-2 ring-[#8DB9F0]/20"
                  : "border-[#DFDEEB] hover:border-[#8DB9F0]/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#8DB9F0]">
                    PROMPT VERSION {pv.version}
                  </span>
                  {pv.version === 3 && (
                    <span className="mira-badge mira-badge-green text-[10px]">Production Candidate</span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[#25283A]">{pv.name}</h3>
                <p className="text-xs text-[#74778A] mt-1 leading-relaxed">
                  {pv.description}
                </p>

                {/* Score Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#DFDEEB] text-center">
                  <div className="p-1.5 rounded bg-[#F8F8FC]">
                    <div className="text-[10px] text-[#74778A]">JSON Validity</div>
                    <div className="font-bold text-xs text-[#25283A] mt-0.5">{bm?.jsonValidity}%</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#F8F8FC]">
                    <div className="text-[10px] text-[#74778A]">Accuracy</div>
                    <div className="font-bold text-xs text-[#248A63] mt-0.5">{bm?.fieldAccuracy}%</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#F8F8FC]">
                    <div className="text-[10px] text-[#74778A]">Guardrail</div>
                    <div className="font-bold text-xs text-[#EE9478] mt-0.5">{bm?.uncertaintyHandling}%</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DFDEEB] flex items-center justify-between text-xs">
                <span className="text-[#9699AA]">{isSelected ? "Selected for Test" : "Click to Select"}</span>
                <span className="font-mono text-[11px] text-[#74778A]">{bm?.latencyMs}ms avg</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Chart */}
      <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs">
        <h3 className="text-sm font-bold text-[#25283A] mb-1">Empirical Prompt Accuracy & Robustness</h3>
        <p className="text-xs text-[#74778A] mb-4">Comparing JSON syntax validity against entity field extraction precision across versions</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={benchmarkData}>
              <XAxis dataKey="version" stroke="#9699AA" fontSize={11} tickLine={false} />
              <YAxis stroke="#9699AA" fontSize={11} tickLine={false} />
              <Tooltip />
              <Bar dataKey="jsonValidity" name="JSON Validity %" fill="#8DB9F0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fieldAccuracy" name="Field Accuracy %" fill="#248A63" radius={[4, 4, 0, 0]} />
              <Bar dataKey="uncertaintyHandling" name="Uncertainty Flag %" fill="#F5B69E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Execution Test Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input & Prompt Inspector */}
        <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#25283A]">Live Test Playground</h3>
              <p className="text-xs text-[#74778A]">Testing with active prompt: Version {activePrompt.version}</p>
            </div>
            <button
              onClick={handleExecuteTest}
              disabled={isRunning}
              className="mira-btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? "Executing Prompt..." : "Run Evaluation Test"}</span>
            </button>
          </div>

          {/* Test Case Quick Select */}
          <div>
            <label className="text-[11px] font-semibold text-[#74778A] block mb-1">Load Synthetic Test Case</label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_TEST_CASES.map((tc, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestInput(tc.text)}
                  className="p-2 text-left rounded-lg border border-[#DFDEEB] bg-[#F8F8FC] hover:bg-[#E9E8F8] text-[11px] font-medium text-[#25283A] truncate"
                >
                  {tc.title}
                </button>
              ))}
            </div>
          </div>

          {/* Input text */}
          <div>
            <label className="text-[11px] font-semibold text-[#74778A] block mb-1">Raw Patient Communication</label>
            <textarea
              rows={4}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="mira-input text-xs resize-none"
            />
          </div>

          {/* Active System Prompt Display */}
          <div>
            <label className="text-[11px] font-semibold text-[#74778A] block mb-1">System Prompt Directive</label>
            <pre className="p-3 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] text-[10px] text-[#25283A] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
              {activePrompt.systemPrompt}
            </pre>
          </div>
        </div>

        {/* Right: Output Inspection & Evaluation Stats */}
        <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#25283A]">Execution Response & Evaluation</h3>
              <p className="text-xs text-[#74778A]">Structure verification & confidence indicators</p>
            </div>
            {latestResult && (
              <span
                className={`mira-badge ${
                  latestResult.isValidJson ? "mira-badge-green" : "mira-badge-red"
                }`}
              >
                {latestResult.isValidJson ? "Valid JSON Schema" : "Malformed Output"}
              </span>
            )}
          </div>

          {latestResult ? (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                  <div className="text-[10px] text-[#74778A]">Extracted Fields</div>
                  <div className="font-bold text-[#25283A] mt-0.5">{latestResult.fieldsExtracted}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                  <div className="text-[10px] text-[#74778A]">Missing Detected</div>
                  <div className="font-bold text-[#EE9478] mt-0.5">{latestResult.fieldsMissing}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                  <div className="text-[10px] text-[#74778A]">Latency</div>
                  <div className="font-bold text-[#25283A] mt-0.5 font-mono">{latestResult.processingMs}ms</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-[11px] font-semibold text-[#74778A] block mb-1">Raw Output Payload</label>
                <pre className="p-3 rounded-xl bg-[#25283A] text-[#8DB9F0] text-[11px] font-mono flex-1 overflow-x-auto whitespace-pre-wrap">
                  {latestResult.output}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#9699AA] border border-dashed border-[#DFDEEB] rounded-xl">
              <FlaskConical className="w-8 h-8 text-[#8DB9F0] mb-2" />
              <p className="text-xs font-semibold text-[#25283A]">No Test Execution Run Yet</p>
              <p className="text-[11px] text-[#74778A] mt-1">
                Select a prompt version, customize test input, and click &quot;Run Evaluation Test&quot;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
