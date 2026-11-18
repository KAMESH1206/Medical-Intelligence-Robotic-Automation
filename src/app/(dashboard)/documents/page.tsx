"use client";


import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import type { Document, DocumentStatus } from "@/lib/types";
import VoiceScribeModal from "@/components/VoiceScribeModal";
import DrugSafetyModal from "@/components/DrugSafetyModal";
import {
  UploadCloud,
  FileText,
  FileCheck,
  AlertTriangle,
  XCircle,
  Play,
  CheckCircle,
  Eye,
  Trash2,
  Sparkles,
  Search,
  Filter,
  Lock,
  X,
  Mic,
  ShieldAlert,
} from "lucide-react";

export default function DocumentsPage() {
  const { documents, uploadDocument, processDocument, approveDocument, rejectDocument, deleteDocument, currentUser } = useMiraStore();
  const perms = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.healthcare_admin;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isVoiceScribeOpen, setIsVoiceScribeOpen] = useState(false);
  const [safetyAuditDoc, setSafetyAuditDoc] = useState<Document | null>(null);

  const getMedicationsFromDoc = (doc: Document | null): string[] => {
    if (!doc || !doc.extractedData) {
      return [
        "Tab Sizodon Plus (Risperidone + Trihexyphenidyl)",
        "Tab Qutipin 200mg (Quetiapine)",
        "Tab Ativan 2mg (Lorazepam)",
        "Tab Rivotril 0.5mg (Clonazepam)",
        "Tab Serta 50mg (Sertraline)",
      ];
    }
    const meds = (doc.extractedData as any).prescribedMedications;
    if (Array.isArray(meds) && meds.length > 0) {
      return meds.map((m: any) =>
        typeof m === "string" ? m : m.medicine || JSON.stringify(m)
      );
    }
    return [
      "Tab Sizodon Plus (Risperidone + Trihexyphenidyl)",
      "Tab Qutipin 200mg (Quetiapine)",
      "Tab Ativan 2mg (Lorazepam)",
      "Tab Rivotril 0.5mg (Clonazepam)",
      "Tab Serta 50mg (Sertraline)",
    ];
  };

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = d.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.includes(",") ? result.split(",")[1] : result;
      uploadDocument({
        name: file.name,
        size: file.size,
        type: file.type,
        base64Data,
        fileUrl: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.includes(",") ? result.split(",")[1] : result;
        uploadDocument({
          name: file.name,
          size: file.size,
          type: file.type,
          base64Data,
          fileUrl: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async (docId: string) => {
    setIsProcessing(docId);
    try {
      const updated = await processDocument(docId);
      if (selectedDoc && selectedDoc.id === docId) {
        setSelectedDoc(updated);
      }
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#25283A] flex items-center gap-2">
            <span>Healthcare Document Intelligence</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase tracking-wider">
              Gemini 3 Flash CDSS
            </span>
          </h2>
          <p className="text-xs text-[#74778A]">
            OCR extraction, clinical document parsing, field confidence scoring, and CDSS drug interaction safety.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsVoiceScribeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#8DB9F0] bg-white hover:bg-[#F5F8FF] text-xs font-semibold text-[#25283A] transition shadow-xs cursor-pointer"
          >
            <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>AI Medical Voice Scribe</span>
          </button>
          <label className="mira-btn-primary text-xs cursor-pointer inline-flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="p-6 rounded-2xl bg-gradient-to-b from-[#E9E8F8]/40 to-white border-2 border-dashed border-[#DFDEEB] flex flex-col items-center justify-center text-center group hover:border-[#8DB9F0] transition-colors cursor-pointer relative"
      >
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="p-3 rounded-full bg-[#8DB9F0]/20 text-[#6BA3E8] mb-2 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-6 h-6 text-[#8DB9F0]" />
        </div>
        <div className="text-sm font-semibold text-[#25283A]">
          Drop medical referral, intake scan, or prescription here
        </div>
        <p className="text-xs text-[#74778A] mt-1">
          Supports PDF, PNG, JPG, JPEG, WEBP up to 15MB. Automatic OCR & AI classification enabled.
        </p>
      </div>

      {/* Sample Healthcare Documents Bar */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#E9E8F8]/60 via-white to-[#F0F8FF] border border-[#DFDEEB] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6BA3E8]" />
            <span className="text-xs font-bold text-[#25283A]">Sample Medical Documents for Testing:</span>
            <span className="text-[11px] text-[#74778A] hidden md:inline">Click link to download/preview, or click &quot;+ Test Load&quot; to queue immediately</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { name: "1_Doctor_Referral_Letter_Cardiology.pdf", label: "1. Referral Letter (Cardiology)", size: 3150 },
            { name: "2_Patient_Intake_Registration_Form.pdf", label: "2. Patient Intake Form", size: 2711 },
            { name: "3_Medical_Prescription_Slip.pdf", label: "3. Prescription Slip (Rx)", size: 2348 },
            { name: "4_Pathology_Blood_Panel_Report.pdf", label: "4. Blood Test Pathology Report", size: 3143 },
            { name: "5_Hospital_Discharge_Summary.pdf", label: "5. Discharge Summary", size: 2454 },
          ].map((sample) => (
            <div key={sample.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DFDEEB] hover:border-[#8DB9F0] shadow-2xs transition">
              <FileText className="w-3.5 h-3.5 text-[#6BA3E8]" />
              <a
                href={`/sample_documents/${sample.name}`}
                target="_blank"
                rel="noreferrer"
                download
                className="font-medium text-[#25283A] hover:text-[#6BA3E8] hover:underline"
                title="Download / View Sample PDF"
              >
                {sample.label}
              </a>
              <span className="text-[#DFDEEB]">|</span>
              <button
                type="button"
                onClick={() => {
                  uploadDocument({
                    name: sample.name,
                    size: sample.size,
                    type: "application/pdf",
                  });
                }}
                className="text-[11px] font-semibold text-[#6BA3E8] hover:text-[#3B82F6] hover:underline cursor-pointer"
                title="Directly load into queue"
              >
                + Test Load
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9699AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search documents by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mira-input mira-input-search text-xs"
              style={{ paddingLeft: "42px" }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#74778A]" />
          <span className="text-[#74778A]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#DFDEEB] rounded-lg px-2.5 py-1.5 bg-[#F8F8FC] text-xs focus:outline-none focus:border-[#8DB9F0]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="needs_review">Needs Review</option>
            <option value="processing">Processing</option>
            <option value="uploaded">Uploaded</option>
            <option value="failed">Failed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table & Mobile Cards */}
      <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 px-4 text-[#74778A]">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#8DB9F0]/15 flex items-center justify-center text-[#8DB9F0]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="font-semibold text-sm text-[#25283A]">No Documents in Processing Queue</div>
              <p className="text-xs text-[#74778A] max-w-sm">
                {documents.length === 0
                  ? "Your document repository is clear. Drag and drop a medical referral PDF or scan above to extract clinical JSON."
                  : "No documents match your active filter."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="mira-table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Format & Size</th>
                    <th>Confidence</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="transition-colors">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#8DB9F0] shrink-0" />
                          <div>
                            <div className="font-semibold text-[#25283A]">{doc.filename}</div>
                            {doc.errorMessage && (
                              <div className="text-[10px] text-rose-500 font-medium">
                                {doc.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="uppercase text-[11px] font-mono font-bold text-[#74778A] px-2 py-0.5 rounded bg-[#E9E8F8]">
                          {doc.fileType}
                        </span>
                        <span className="text-[11px] text-[#74778A] ml-2">
                          {(doc.fileSize / 1024).toFixed(0)} KB
                        </span>
                      </td>
                      <td>
                        {doc.confidence !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-[#E9E8F8] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  doc.confidence >= 0.85
                                    ? "bg-[#248A63]"
                                    : doc.confidence >= 0.7
                                    ? "bg-[#8DB9F0]"
                                    : "bg-[#F5B69E]"
                                }`}
                                style={{ width: `${Math.round(doc.confidence * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-[#25283A]">
                              {Math.round(doc.confidence * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#9699AA] italic">Pending OCR</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`mira-badge ${
                            doc.status === "completed"
                              ? "mira-badge-green"
                              : doc.status === "needs_review"
                              ? "mira-badge-peach"
                              : doc.status === "processing"
                              ? "mira-badge-blue"
                              : doc.status === "failed"
                              ? "mira-badge-red"
                              : "mira-badge-gray"
                          }`}
                        >
                          {doc.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="text-xs text-[#74778A]">
                        {new Date(doc.uploadedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {doc.status === "uploaded" && (
                            <button
                              onClick={() => handleProcess(doc.id)}
                              disabled={isProcessing === doc.id}
                              className="px-2.5 py-1 rounded-lg bg-[#8DB9F0] text-white text-xs font-semibold hover:bg-[#6BA3E8] transition flex items-center gap-1 disabled:opacity-50"
                            >
                              <Play className="w-3 h-3" />
                              {isProcessing === doc.id ? "Extracting..." : "Process"}
                            </button>
                          )}
                          <button
                            onClick={() => setSafetyAuditDoc(doc)}
                            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-700 hover:bg-amber-100 transition"
                            title="Run Clinical Drug-Drug Interaction (DDI) Safety Audit"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-1.5 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#E9E8F8] hover:text-[#25283A] transition"
                            title="Inspect AI JSON & OCR"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${doc.filename}"?`)) {
                                deleteDocument(doc.id);
                                if (selectedDoc?.id === doc.id) {
                                  setSelectedDoc(null);
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden divide-y divide-[#DFDEEB]">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#8DB9F0] shrink-0" />
                      <div>
                        <div className="font-bold text-xs text-[#25283A]">{doc.filename}</div>
                        <div className="text-[10px] text-[#74778A]">
                          {(doc.fileSize / 1024).toFixed(0)} KB · {doc.fileType.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`mira-badge text-[10px] ${
                        doc.status === "completed"
                          ? "mira-badge-green"
                          : doc.status === "needs_review"
                          ? "mira-badge-peach"
                          : doc.status === "processing"
                          ? "mira-badge-blue"
                          : doc.status === "failed"
                          ? "mira-badge-red"
                          : "mira-badge-gray"
                      }`}
                    >
                      {doc.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-[#F8F8FC] p-2.5 rounded-lg border border-[#DFDEEB]/60">
                    <div>
                      <div className="text-[10px] text-[#74778A] font-semibold uppercase">OCR Confidence</div>
                      <div className="text-xs font-bold text-[#25283A] mt-0.5">
                        {doc.confidence !== undefined ? `${Math.round(doc.confidence * 100)}%` : "Pending"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#74778A] font-semibold uppercase">Uploaded</div>
                      <div className="text-[11px] text-[#74778A] mt-0.5">
                        {new Date(doc.uploadedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {doc.status === "uploaded" && (
                      <button
                        onClick={() => handleProcess(doc.id)}
                        disabled={isProcessing === doc.id}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-[#8DB9F0] text-white text-xs font-semibold hover:bg-[#6BA3E8] transition flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isProcessing === doc.id ? "Extracting..." : "Process"}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSafetyAuditDoc(doc)}
                      className="flex-1 py-1.5 px-2 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1"
                      title="Run Drug Safety Audit"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Drug Safety</span>
                    </button>
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="flex-1 py-1.5 px-2 rounded-lg border border-[#DFDEEB] bg-white text-[#25283A] text-xs font-semibold flex items-center justify-center gap-1"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#8DB9F0]" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${doc.filename}"?`)) {
                          deleteDocument(doc.id);
                          if (selectedDoc?.id === doc.id) {
                            setSelectedDoc(null);
                          }
                        }
                      }}
                      className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-[#9699AA] hover:text-rose-600 transition"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto bg-white rounded-2xl p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#DFDEEB] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8DB9F0] px-2 py-0.5 rounded bg-[#E9E8F8]">
                  {selectedDoc.fileType} Document
                </span>
                <h3 className="text-base font-bold text-[#25283A] mt-1">{selectedDoc.filename}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                <div className="text-[#74778A]">Status</div>
                <div className="font-semibold text-[#25283A] mt-0.5 capitalize">
                  {selectedDoc.status.replace("_", " ")}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                <div className="text-[#74778A]">Extraction Confidence</div>
                <div className="font-semibold text-[#25283A] mt-0.5">
                  {selectedDoc.confidence ? `${Math.round(selectedDoc.confidence * 100)}%` : "N/A"}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                <div className="text-[#74778A]">File Size</div>
                <div className="font-semibold text-[#25283A] mt-0.5">
                  {(selectedDoc.fileSize / 1024).toFixed(0)} KB
                </div>
              </div>
            </div>

            {selectedDoc.fileUrl && selectedDoc.fileType !== "pdf" && (
              <div className="border border-[#DFDEEB] rounded-xl overflow-hidden bg-[#F8F8FC]">
                <div className="px-3 py-1.5 bg-[#E9E8F8] border-b border-[#DFDEEB] text-[11px] font-semibold text-[#25283A] flex items-center justify-between">
                  <span>Document Visual Scan</span>
                  <span className="text-[10px] text-[#6BA3E8] font-bold">Google Gemini 3 Flash Multimodal OCR</span>
                </div>
                <div className="max-h-60 overflow-y-auto flex items-center justify-center p-2 bg-slate-900/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedDoc.fileUrl}
                    alt={selectedDoc.filename}
                    className="max-h-56 max-w-full rounded object-contain shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* Clinical Decision Support / Drug-Drug Interaction Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    Clinical Decision Support (CDSS) & Safety Guardian
                  </div>
                  <div className="text-[11px] text-amber-800/80">
                    Audit prescription for Drug-Drug Interactions (DDI), polypharmacy toxicity, and organ clearance.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSafetyAuditDoc(selectedDoc)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm shrink-0 cursor-pointer"
              >
                Launch Safety Audit
              </button>
            </div>

            {selectedDoc.ocrText && (
              <div>
                <label className="text-xs font-semibold text-[#25283A] block mb-1">OCR Raw Text</label>
                <pre className="p-3 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] text-[11px] text-[#74778A] whitespace-pre-wrap font-mono">
                  {selectedDoc.ocrText}
                </pre>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#25283A] block mb-1">
                Extracted Structured JSON
              </label>
              <pre className="p-3 rounded-xl bg-[#25283A] text-[#8DB9F0] text-[11px] overflow-x-auto font-mono rounded-lg">
                {JSON.stringify(selectedDoc.extractedData || { notice: "Extraction pending or failed." }, null, 2)}
              </pre>
            </div>

            {/* Human In The Loop Validation Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#DFDEEB]">
              <div className="flex items-center gap-2">
                {perms.canApproveDocument ? (
                  <>
                    <button
                      onClick={() => {
                        approveDocument(selectedDoc.id);
                        setSelectedDoc({ ...selectedDoc, status: "completed" });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Data</span>
                    </button>
                    <button
                      onClick={() => {
                        rejectDocument(selectedDoc.id);
                        setSelectedDoc({ ...selectedDoc, status: "rejected" });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F8FC] border border-[#DFDEEB] text-xs font-medium text-[#74778A]">
                    <Lock className="w-3.5 h-3.5 text-[#9699AA]" />
                    <span>Approval Authority Locked ({perms.label} Role)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${selectedDoc.filename}"?`)) {
                      deleteDocument(selectedDoc.id);
                      setSelectedDoc(null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  title="Delete this document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-1.5 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#F8F8FC] text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Scribe Modal */}
      <VoiceScribeModal
        isOpen={isVoiceScribeOpen}
        onClose={() => setIsVoiceScribeOpen(false)}
      />

      {/* Drug Safety Guardian Modal */}
      {safetyAuditDoc && (
        <DrugSafetyModal
          isOpen={!!safetyAuditDoc}
          onClose={() => setSafetyAuditDoc(null)}
          medications={getMedicationsFromDoc(safetyAuditDoc)}
          patientName={
            (safetyAuditDoc.extractedData as any)?.patientName ||
            safetyAuditDoc.filename.replace(/\.[^/.]+$/, "")
          }
          patientConditions={[
            "Schizophrenia (Paranoid type)",
            "Hypertension (HTN)",
            "Diabetes Mellitus (DM)",
            "Hypercholesterolemia",
          ]}
        />
      )}
    </div>
  );
}

