"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";

export default function DemoGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  const capabilityModules = [
    {
      num: "01",
      title: "Operations Command Center",
      route: "/dashboard",
      desc: "Unified clinical throughput tracking, patient enquiry trends, and real-time security event telemetry.",
    },
    {
      num: "02",
      title: "Patient Intake & Quality Governance",
      route: "/patients",
      desc: "Automated format standardization, completeness scoring (0-100), and missing field triage alerts.",
    },
    {
      num: "03",
      title: "Document Intelligence & OCR Parsing",
      route: "/documents",
      desc: "Multimodal OCR text parsing, structured clinical entity extraction, and mandatory human authorization gates.",
    },
    {
      num: "04",
      title: "Prompt Engineering Evaluation Lab",
      route: "/prompt-lab",
      desc: "Empirical benchmarking of enterprise LLM prompts, validating JSON schema conformance and confidence scores.",
    },
    {
      num: "05",
      title: "Robotic Workflow Automation Engine",
      route: "/automation",
      desc: "Orchestrated robotic pipelines for automated clinic scheduling, administrative alerts, and notifications.",
    },
  ];

  return (
    <>
      {/* Floating Operations Reference Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#DFDEEB] text-[#25283A] text-xs font-semibold shadow-md hover:bg-[#F8F8FC] hover:border-[#8DB9F0] transition-all cursor-pointer"
        title="View Platform Capabilities Reference"
      >
        <HelpCircle className="w-4 h-4 text-[#8DB9F0]" />
        <span>Operations Guide</span>
      </button>

      {/* Operations Reference Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto bg-white rounded-2xl p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#DFDEEB] pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8DB9F0] uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Platform Architecture & Capabilities</span>
                </div>
                <h3 className="text-base font-bold text-[#25283A] mt-0.5">
                  MIRA Ops Intelligence System Guide
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#74778A]">
              Explore the core clinical automation modules powering MIRA Ops Intelligence:
            </p>

            <div className="space-y-2.5">
              {capabilityModules.map((m) => (
                <div
                  key={m.num}
                  className="p-3 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#25283A] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#8DB9F0] text-white flex items-center justify-center text-[10px] font-bold">
                        {m.num}
                      </span>
                      <span>{m.title}</span>
                    </div>
                    <Link
                      href={m.route}
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] text-[#6BA3E8] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Open Module</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-[11px] text-[#74778A] pl-7 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#E9E8F8]/50 border border-[#DFDEEB] text-[11px] text-[#25283A] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-[#8DB9F0]" />
                <span>MIRA: Medical Intelligence & Robotic Automation</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-[#8DB9F0] text-white font-semibold text-xs hover:bg-[#6BA3E8] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
