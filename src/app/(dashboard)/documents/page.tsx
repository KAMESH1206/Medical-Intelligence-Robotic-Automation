"use client";


import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import type { Document, DocumentStatus } from "@/lib/types";
import {
  UploadCloud,
  FileText,
  FileCheck,
  AlertTriangle,
  XCircle,
  Play,
  CheckCircle,
  Eye,
  Sparkles,
  Search,
  Filter,
  Lock,
  X,
} from "lucide-react";

export default function DocumentsPage() {
  const { documents, uploadDocument, processDocument, approveDocument, rejectDocument, currentUser } = useMiraStore();
  const perms = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.healthcare_admin;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = d.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    uploadDocument({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    e.target.value = "";
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
          <h2 className="text-xl font-bold text-[#25283A]">Healthcare Document Intelligence</h2>
          <p className="text-xs text-[#74778A]">
            OCR extraction, clinical document parsing, field confidence scoring, and human validation.
          </p>
        </div>
        <label className="mira-btn-primary text-xs cursor-pointer inline-flex items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#E9E8F8]/40 to-white border-2 border-dashed border-[#DFDEEB] flex flex-col items-center justify-center text-center group hover:border-[#8DB9F0] transition-colors cursor-pointer relative">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
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
          Supports PDF, PNG, JPG, JPEG up to 15MB. Automatic OCR & AI classification enabled.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9699AA] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search documents by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mira-input pl-9 text-xs"
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

      {/* Documents Table */}
      <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
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
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#9699AA]">
                    No documents found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
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
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#E9E8F8] hover:text-[#25283A] transition"
                          title="Inspect AI JSON & OCR"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#F8F8FC] text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

