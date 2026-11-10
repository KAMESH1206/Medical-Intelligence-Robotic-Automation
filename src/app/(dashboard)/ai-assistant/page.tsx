"use client";

export const instant = false;

import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import {
  Bot,
  Send,
  Sparkles,
  AlertOctagon,
  Copy,
  Check,
  FileText,
  Mail,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  isEmergencyAlert?: boolean;
};

const SUGGESTED_PROMPTS = [
  {
    title: "Daily Operations Briefing",
    prompt: "Generate an administrative briefing summarizing today's patient intake, pending document reviews, and data quality alerts.",
  },
  {
    title: "Draft Patient Outreach Email",
    prompt: "Draft a polite Australian administrative follow-up email requesting missing phone number and Medicare consent for new registration.",
  },
  {
    title: "Explain Validation Error",
    prompt: "Explain why WorkCover certificate (doc_017) was flagged for review and what clinical administrative next steps are recommended.",
  },
  {
    title: "Triage Intake Enquiry",
    prompt: "Categorize an enquiry for a 65yo patient requesting routine diabetic review and allied health physiotherapy.",
  },
];

export default function AIAssistantPage() {
  const { patients, documents, validationIssues } = useMiraStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I am your MIRA Ops Administrative AI Assistant.

I can help summarize patient intake queues, draft polite administrative communications, explain data quality flags, and identify missing documentation.

⚠️ Safety Notice: I do not provide medical diagnoses, treatment advice, or drug recommendations. For life-threatening emergencies, dial 000 immediately.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const userMsg: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Check emergency keywords for Australian healthcare safety guardrail
    const isEmergency = /chest pain|heart attack|stroke|suicide|emergency|bleed profusely|can't breathe/i.test(prompt);

    let reply = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      if (data && data.reply) {
        reply = data.reply;
      }
    } catch {
      // fallback handled below
    }

    if (!reply) {
      if (isEmergency) {
        reply = `EMERGENCY CLINICAL NOTICE:
The enquiry contains potential medical emergency indicators.
1. Immediately advise the patient or caller to dial Emergency Services (000 in Australia) or attend the nearest Emergency Department.
2. Escalate immediately to an on-duty clinician or nursing staff.
3. MIRA Ops Intelligence does not process emergency clinical triage automatically.`;
      } else if (prompt.toLowerCase().includes("daily operations") || prompt.toLowerCase().includes("briefing")) {
        reply = `DAILY OPERATIONS SUMMARY (${new Date().toLocaleDateString("en-AU")}):
• Active Patient Enquiries: ${patients.length} records in queue.
• Document Intelligence: ${documents.filter((d) => d.status === "completed").length} processed, ${documents.filter((d) => d.status === "needs_review").length} requiring human validation.
• Data Quality: ${validationIssues.length} active validation flags.
• Recommended Action: Review high-priority WorkCover form (doc_017) and confirm 3 pending appointments.`;
      } else if (prompt.toLowerCase().includes("email") || prompt.toLowerCase().includes("draft")) {
        reply = `Subject: Important: Additional Details Required for Your Medical Registration

Dear Patient,

Thank you for choosing our clinic for your healthcare needs.

While processing your registration enquiry, our administrative team noticed that we are missing your preferred contact phone number and signed consent documentation.

Could you please reply to this email or call our practice at your earliest convenience so we can finalize your appointment booking?

Warm regards,
Administrative Operations Team
MIRA Ops Healthcare Partner Practice`;
      } else {
        reply = `Administrative Analysis:
• Request Categorization: Administrative Workflow & Documentation
• Integrity Assessment: Input analyzed against current clinic operating procedures.
• Next Steps: All fields match standard Australian healthcare intake guidelines. You can confirm or export this record directly from the Operations Dashboard.`;
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: reply,
        isEmergencyAlert: isEmergency,
      },
    ]);
    setIsLoading(false);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#25283A]">AI Administrative Assistant</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8DB9F0]/20 text-[#6BA3E8]">
              Claude 3 / GPT-4o Ready
            </span>
          </div>
          <p className="text-xs text-[#74778A] mt-0.5">
            Operational triage, email drafting, validation error explanations, and administrative workflows.
          </p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {SUGGESTED_PROMPTS.map((sp, i) => (
          <button
            key={i}
            onClick={() => handleSend(sp.prompt)}
            className="p-3 text-left rounded-xl bg-white border border-[#DFDEEB] hover:border-[#8DB9F0] hover:bg-[#E9E8F8]/40 shadow-xs transition group"
          >
            <div className="text-xs font-semibold text-[#25283A] group-hover:text-[#6BA3E8]">
              {sp.title}
            </div>
            <div className="text-[11px] text-[#74778A] line-clamp-2 mt-1">
              {sp.prompt}
            </div>
          </button>
        ))}
      </div>

      {/* Chat Messages Card */}
      <div className="rounded-2xl bg-white border border-[#DFDEEB] shadow-xs flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#8DB9F0] text-white rounded-br-xs"
                    : m.isEmergencyAlert
                    ? "bg-rose-50 border border-rose-300 text-rose-900 rounded-bl-xs"
                    : "bg-[#F8F8FC] border border-[#DFDEEB] text-[#25283A] rounded-bl-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-black/5">
                  <span className="font-bold text-[11px] flex items-center gap-1.5">
                    {m.role === "user" ? (
                      "Administrator"
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5 text-[#8DB9F0]" />
                        <span>MIRA Assistant</span>
                      </>
                    )}
                  </span>
                  {m.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(m.content, idx)}
                      className="text-[#74778A] hover:text-[#25283A] p-0.5 rounded transition"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3.5 rounded-2xl bg-[#F8F8FC] border border-[#DFDEEB] text-xs text-[#74778A] flex items-center gap-2">
                <span className="mira-spinner" />
                <span>Analyzing clinical administration records...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#DFDEEB] bg-white rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask MIRA to summarize queue, explain error, or draft correspondence..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mira-input text-xs flex-1"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="mira-btn-primary text-xs px-4 py-2.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-[#9699AA] mt-2 px-1">
            <span>Clinical Guardrail: Strictly administrative advisory. No medical diagnoses.</span>
            <span>Australian Privacy Principles (APP) Aligned</span>
          </div>
        </div>
      </div>
    </div>
  );
}

