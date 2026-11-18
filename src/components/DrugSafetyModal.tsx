"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  RefreshCw,
  X,
} from "lucide-react";

interface DrugInteraction {
  drugPair: string;
  severity: "high" | "moderate" | "low";
  clinicalEffect: string;
  actionableAdvice: string;
}

interface OrganVigilance {
  system: string;
  riskLevel: "high" | "moderate" | "low";
  clinicalMonitoring: string;
}

interface SafetyData {
  safetyLevel: "safe" | "advisory" | "critical_warning";
  overallSafetyScore: number;
  summary: string;
  drugInteractions: DrugInteraction[];
  allergyAlerts: Array<{ allergen: string; severity: string; reaction: string }>;
  organSystemVigilance: OrganVigilance[];
  pharmacistRecommendation: string;
}

interface DrugSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: string[];
  patientName?: string;
  patientConditions?: string[];
  patientAllergies?: string[];
}

export default function DrugSafetyModal({
  isOpen,
  onClose,
  medications = [],
  patientName = "Patient",
  patientConditions = ["Schizophrenia", "Hypertension", "Diabetes"],
  patientAllergies = ["No Known Drug Allergies (NKDA)"],
}: DrugSafetyModalProps) {
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAudit = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/clinical/safety-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medications,
          patientName,
          patientConditions,
          patientAllergies,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSafetyData(json.data);
        }
      }
    } catch (err) {
      console.warn("Clinical safety audit error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [medications, patientName, patientConditions, patientAllergies]);

  useEffect(() => {
    if (isOpen && medications.length > 0) {
      runAudit();
    }
  }, [isOpen, medications, runAudit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DFDEEB] pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl text-white shadow-sm ${safetyData?.safetyLevel === "critical_warning"
                ? "bg-rose-600"
                : safetyData?.safetyLevel === "advisory"
                  ? "bg-amber-600"
                  : "bg-emerald-600"
                }`}
            >
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#25283A]">
                  Clinical Drug-Drug Interaction (DDI) & Safety Guardian
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#E9E8F8] text-[#25283A] text-[10px] font-bold">
                  CDSS AI
                </span>
              </div>
              <p className="text-xs text-[#74778A]">
                Pharmacological audit for polypharmacy conflicts, additive CNS/cardiac toxicity, and allergy alerts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription Context Banner */}
        <div className="p-3 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-[#74778A]">Patient: </span>
            <strong className="text-[#25283A]">{patientName}</strong>
          </div>
          <div>
            <span className="text-[#74778A]">Audited Drugs: </span>
            <strong className="text-[#25283A]">{medications.length} items</strong>
          </div>
          <button
            onClick={runAudit}
            disabled={isLoading}
            className="text-[11px] font-semibold text-[#6BA3E8] hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-Audit Regimen</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#74778A] space-y-3">
            <RefreshCw className="w-8 h-8 text-[#8DB9F0] mx-auto animate-spin" />
            <div className="font-semibold text-sm text-[#25283A]">
              Analyzing Pharmacological Regimen with Gemini 3 Flash...
            </div>
            <p className="max-w-md mx-auto text-[11px]">
              Cross-referencing drug-drug interactions, additive GABA sedation, QTc prolongation, and organ clearance.
            </p>
          </div>
        ) : safetyData ? (
          <div className="space-y-4">
            {/* Safety Score & Status Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${safetyData.safetyLevel === "critical_warning"
                ? "bg-rose-50/80 border-rose-300 text-rose-900"
                : safetyData.safetyLevel === "advisory"
                  ? "bg-amber-50/80 border-amber-300 text-amber-900"
                  : "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${safetyData.safetyLevel === "critical_warning"
                      ? "bg-rose-600 text-white"
                      : safetyData.safetyLevel === "advisory"
                        ? "bg-amber-600 text-white"
                        : "bg-emerald-600 text-white"
                      }`}
                  >
                    {safetyData.safetyLevel.replace("_", " ")}
                  </span>
                  <span className="text-sm font-bold">
                    {safetyData.safetyLevel === "critical_warning"
                      ? "High Clinical Risk / Therapeutic Duplication"
                      : safetyData.safetyLevel === "advisory"
                        ? "Clinical Advisory / Moderate Interaction"
                        : "Regimen Verified Safe"}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">{safetyData.summary}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] font-bold uppercase opacity-75">Regimen Safety Score</div>
                <div className="text-2xl font-black">{safetyData.overallSafetyScore}/100</div>
              </div>
            </div>

            {/* Drug-Drug Interactions List */}
            {safetyData.drugInteractions.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#25283A] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Detected Pharmacological Interactions ({safetyData.drugInteractions.length}):</span>
                </label>
                <div className="space-y-2">
                  {safetyData.drugInteractions.map((ddi, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-[#DFDEEB] shadow-2xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#25283A]">{ddi.drugPair}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${ddi.severity === "high"
                            ? "bg-rose-100 text-rose-700"
                            : ddi.severity === "moderate"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                            }`}
                        >
                          {ddi.severity} Severity
                        </span>
                      </div>
                      <p className="text-[11px] text-[#74778A] leading-normal">{ddi.clinicalEffect}</p>
                      <div className="text-[11px] text-[#248A63] font-medium bg-[#F8F8FC] p-2 rounded-lg border border-[#DFDEEB]/50">
                        <strong>Physician Advisory:</strong> {ddi.actionableAdvice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organ System Vigilance */}
            {safetyData.organSystemVigilance.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#25283A] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#8DB9F0]" />
                  <span>Organ System Vigilance & Monitoring:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {safetyData.organSystemVigilance.map((org, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#F8F8FC] border border-[#DFDEEB] space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#25283A]">{org.system}</strong>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${org.riskLevel === "high"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-800"
                            }`}
                        >
                          {org.riskLevel} risk
                        </span>
                      </div>
                      <p className="text-[10px] text-[#74778A]">{org.clinicalMonitoring}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pharmacist Actionable Recommendation */}
            <div className="p-3 rounded-xl bg-[#E9E8F8] border border-[#DFDEEB] text-xs space-y-1">
              <span className="font-bold text-[#25283A] text-[10px] uppercase tracking-wider block">
                Clinical Pharmacologist Final Recommendation:
              </span>
              <p className="text-[11px] text-[#25283A] leading-relaxed">
                {safetyData.pharmacistRecommendation}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-end pt-3 border-t border-[#DFDEEB]">
          <button
            type="button"
            onClick={onClose}
            className="mira-btn-primary text-xs"
          >
            Close Safety Audit
          </button>
        </div>
      </div>
    </div>
  );
}
