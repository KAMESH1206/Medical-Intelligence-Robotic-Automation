"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FlaskConical,
  FileText,
  Users,
  Shield,
  GitBranch,
} from "lucide-react";

export default function DemoGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  const demoSteps = [
    {
      step: "1",
      title: "Operations Command Center",
      route: "/dashboard",
      script: "Highlight 6 KPI cards derived from real records, enquiry volume trends, and real-time audit logs.",
    },
    {
      step: "2",
      title: "Patient Intake & Quality Score",
      route: "/patients",
      script: "Show how missing fields (e.g. phone/email) automatically decrease validation score and flag records for triage.",
    },
    {
      step: "3",
      title: "Document Intelligence & OCR",
      route: "/documents",
      script: "Demonstrate drag-and-drop OCR, inspection of structured JSON with field-level confidence scores, and human approval gates.",
    },
    {
      step: "4",
      title: "Prompt Engineering Lab (Core Highlight)",
      route: "/prompt-lab",
      script: "Run live extraction test comparing Prompt V1 vs V2 vs V3. Explain the jump from 20% to 99.8% JSON validity.",
    },
    {
      step: "5",
      title: "Robotic Workflows & Role Governance",
      route: "/automation",
      script: "Click 'Execute Workflow' to show robotic task sequence and duration. Then switch role to Viewer in the top bar.",
    },
  ];

  return (
    <>
      {/* Floating System Tour Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#8DB9F0] text-white text-xs font-bold shadow-lg hover:bg-[#6BA3E8] transition-all hover:scale-105 cursor-pointer"
        title="Open Platform Feature Guide"
      >
        <Sparkles className="w-4 h-4 text-white" />
        <span>Platform Guide</span>
      </button>

      {/* Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#DFDEEB] pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8DB9F0] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>5-Minute Interview Presentation Walkthrough</span>
                </div>
                <h3 className="text-base font-bold text-[#25283A] mt-0.5">
                  MIRA Ops Intelligence Live Demo Flow
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#74778A]">
              Follow this sequence during your interview screen share to demonstrate deep technical mastery:
            </p>

            <div className="space-y-2.5">
              {demoSteps.map((s) => (
                <div
                  key={s.step}
                  className="p-3 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#25283A] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#8DB9F0] text-white flex items-center justify-center text-[10px] font-bold">
                        {s.step}
                      </span>
                      <span>{s.title}</span>
                    </div>
                    <Link
                      href={s.route}
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] text-[#6BA3E8] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-[11px] text-[#74778A] pl-7 leading-relaxed">
                    {s.script}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#E9E8F8]/50 border border-[#DFDEEB] text-[11px] text-[#25283A] flex items-center justify-between">
              <span className="font-semibold">MIRA = Medical Intelligence & Robotic Automation</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-[#8DB9F0] text-white font-semibold text-xs hover:bg-[#6BA3E8]"
              >
                Got It, Start Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

