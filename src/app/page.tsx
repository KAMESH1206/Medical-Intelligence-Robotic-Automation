"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot,
  FileCheck2,
  Calendar,
  Building2,
  GitBranch,
  FlaskConical,
  Lock,
  CheckCircle2,
  Zap,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const capabilities = [
    {
      title: "AI Patient Intake Automation",
      description: "Omnichannel intake parsing with clinical administrative classification and missing field detection.",
      icon: Bot,
      color: "bg-[#8DB9F0]/20 text-[#6BA3E8]",
    },
    {
      title: "Healthcare Document Intelligence",
      description: "High-precision OCR and structured clinical extraction from PDFs, referrals, and scans.",
      icon: FileCheck2,
      color: "bg-[#E9E8F8] text-[#25283A]",
    },
    {
      title: "Data Quality & Duplicate Engine",
      description: "Continuous rule validation and human-supervised patient record deduplication.",
      icon: ShieldCheck,
      color: "bg-[#F5B69E]/30 text-[#EE9478]",
    },
    {
      title: "Smart Appointment Operations",
      description: "Automated schedule availability checking, conflict prevention, and booking workflows.",
      icon: Calendar,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Provider Intelligence Collector",
      description: "Compliant Australian healthcare public directory scraper and clinic metadata registry.",
      icon: Building2,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Prompt Engineering Lab",
      description: "Empirical benchmarking across Naive, Structured JSON, and Enterprise Guardrail prompts.",
      icon: FlaskConical,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const workflowSteps = [
    {
      num: "01",
      title: "Intake & Ingestion",
      desc: "Patient forms and medical referral PDFs ingested via drag-and-drop or web API.",
    },
    {
      num: "02",
      title: "OCR & AI Extraction",
      desc: "Multimodal OCR extracts raw text; Prompt V3 normalizes structured entities with confidence scores.",
    },
    {
      num: "03",
      title: "Quality Audit & Deduplication",
      desc: "Validation engine checks required fields, flags phone/email errors, and alerts on duplicate candidates.",
    },
    {
      num: "04",
      title: "Robotic Automation & Notification",
      desc: "APScheduler-driven workflows trigger clinic scheduling, administrative alerts, and email confirmations.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8FC] text-[#25283A] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-[#DFDEEB] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8DB9F0] flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#25283A]">
                MIRA Ops Intelligence
              </span>
              <span className="ml-2 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#E9E8F8] text-[#25283A]">
                Healthcare SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#74778A] hover:text-[#25283A] transition hidden sm:inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="mira-btn-primary text-xs shadow-xs"
            >
              <span>Launch Live Prototype</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9E8F8] border border-[#DFDEEB] text-xs font-semibold text-[#25283A]">
          <span className="w-2 h-2 rounded-full bg-[#8DB9F0] animate-ping" />
          <span>Next-Generation Healthcare Robotic Workflow Automation</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#25283A] max-w-4xl mx-auto leading-tight">
          Intelligent Healthcare Operations,{" "}
          <span className="text-[#6BA3E8]">Powered by AI</span>
        </h1>

        <p className="text-sm sm:text-base text-[#74778A] max-w-2xl mx-auto leading-relaxed">
          Automate repetitive patient intake, medical document intelligence, data deduplication, and appointment operations with empirical prompt guardrails.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-[#8DB9F0] text-white font-semibold text-sm hover:bg-[#6BA3E8] transition shadow-md flex items-center gap-2"
          >
            <span>Explore Operations Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/prompt-lab"
            className="px-6 py-3 rounded-xl bg-[#E9E8F8] text-[#25283A] font-semibold text-sm hover:bg-[#DDDCF5] border border-[#DFDEEB] transition flex items-center gap-2"
          >
            <FlaskConical className="w-4 h-4 text-[#8DB9F0]" />
            <span>Prompt Evaluation Lab</span>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-6 pt-8 text-xs text-[#74778A]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#248A63]" /> Australian Healthcare Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#248A63]" /> Multi-Tier Role Governance
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#248A63]" /> Empirical Prompt Versioning
          </span>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="py-16 px-6 bg-white border-y border-[#DFDEEB]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-[#25283A]">
              Comprehensive Healthcare Operations Suite
            </h2>
            <p className="text-xs text-[#74778A]">
              Six integrated engines designed to replace error-prone administrative overhead with high-confidence automated workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#F8F8FC] border border-[#DFDEEB] hover:border-[#8DB9F0] transition space-y-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cap.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[#25283A]">{cap.title}</h3>
                  <p className="text-xs text-[#74778A] leading-relaxed">{cap.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Explanation Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-[#25283A]">
            End-to-End Automated Pipeline
          </h2>
          <p className="text-xs text-[#74778A]">
            From unstructured incoming enquiry to verified clinical booking in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step) => (
            <div
              key={step.num}
              className="p-6 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs space-y-2 relative"
            >
              <div className="font-mono text-2xl font-bold text-[#8DB9F0]/60">
                {step.num}
              </div>
              <h3 className="font-bold text-sm text-[#25283A]">{step.title}</h3>
              <p className="text-xs text-[#74778A] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Privacy Banner */}
      <section className="py-12 px-6 bg-[#E9E8F8]/40 border-y border-[#DFDEEB]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25283A]">
              <Lock className="w-4 h-4 text-[#8DB9F0]" />
              <span>Privacy by Design & Clinical Guardrails</span>
            </div>
            <h3 className="text-lg font-bold text-[#25283A]">
              Zero Real PHI in Demo Environment
            </h3>
            <p className="text-xs text-[#74778A] max-w-xl">
              Equipped with synthetic Australian healthcare datasets, strict role-based access control, and mandatory human authorization for duplicate resolution.
            </p>
          </div>
          <Link
            href="/audit-logs"
            className="px-5 py-2.5 rounded-xl bg-white border border-[#DFDEEB] text-xs font-semibold text-[#25283A] hover:bg-[#F8F8FC] transition whitespace-nowrap shadow-xs"
          >
            View Security Audit Trail
          </Link>
        </div>
      </section>

      {/* Technology Stack Details */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center space-y-8">
        <h2 className="text-xl font-bold text-[#25283A]">
          Engineered with Modern Enterprise Architecture
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-[#DFDEEB]">
            <div className="font-bold text-[#25283A]">Next.js 16 App Router</div>
            <div className="text-[11px] text-[#74778A] mt-0.5">Turbopack, TypeScript, React 19</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#DFDEEB]">
            <div className="font-bold text-[#25283A]">FastAPI Backend</div>
            <div className="text-[11px] text-[#74778A] mt-0.5">Python 3.12, Pydantic, SQLAlchemy</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#DFDEEB]">
            <div className="font-bold text-[#25283A]">PostgreSQL Database</div>
            <div className="text-[11px] text-[#74778A] mt-0.5">Supabase compatible, Alembic</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#DFDEEB]">
            <div className="font-bold text-[#25283A]">Claude 3 / GPT-4o</div>
            <div className="text-[11px] text-[#74778A] mt-0.5">Field confidence & Prompt Lab</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#DFDEEB] bg-white py-8 px-6 text-xs text-[#74778A]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-[#25283A]">MIRA Ops Intelligence</span> · Healthcare Data Intelligence & Robotic Workflow Automation Platform
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/dashboard" className="hover:text-[#25283A]">Dashboard</Link>
            <Link href="/prompt-lab" className="hover:text-[#25283A]">Prompt Lab</Link>
            <Link href="/settings" className="hover:text-[#25283A]">Settings</Link>
            <Link href="/login" className="hover:text-[#25283A]">Login</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-[#DFDEEB] text-[11px] text-[#9699AA] text-center md:text-left">
          Important Notice: This application is an independent healthcare technology prototype inspired by publicly described healthcare automation challenges. It is not an official Gokul Infocare product and must never be represented as an implementation of its proprietary MIRA platform.
        </div>
      </footer>
    </div>
  );
}
