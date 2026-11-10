"use client";

export const instant = false;

import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import {
  Building2,
  Globe,
  Play,
  Pause,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function ProvidersPage() {
  const { providers, collectProviders } = useMiraStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollecting, setIsCollecting] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("https://healthengine.com.au/directory/au");
  const [lastCollectedCount, setLastCollectedCount] = useState<number | null>(null);

  const filteredProviders = providers.filter((p) => {
    return (
      p.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.providerName && p.providerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.suburb && p.suburb.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.state && p.state.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleStartCollection = async () => {
    setIsCollecting(true);
    setLastCollectedCount(null);
    try {
      const count = await collectProviders(sourceUrl);
      setLastCollectedCount(count);
    } finally {
      setIsCollecting(false);
    }
  };

  const exportCSV = () => {
    const headers = "Clinic Name,Provider Name,Address,Phone,Email,Website,Category,State,Source URL\n";
    const rows = filteredProviders
      .map(
        (p) =>
          `"${p.clinicName}","${p.providerName || ""}","${p.address || ""}","${p.phone || ""}","${p.email || ""}","${p.website || ""}","${p.category || ""}","${p.state || ""}","${p.sourceUrl || ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mira_australian_providers_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#25283A]">Healthcare Provider Intelligence</h2>
          <p className="text-xs text-[#74778A]">
            Australian medical clinic registry, public directory scraping, and provider attribution engine.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DFDEEB] bg-white hover:bg-[#F8F8FC] text-xs font-medium text-[#25283A] transition"
        >
          <Download className="w-3.5 h-3.5 text-[#74778A]" />
          <span>Export Provider CSV</span>
        </button>
      </div>

      {/* Scraper Collector Control Panel */}
      <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#DFDEEB] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#25283A] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#8DB9F0]" />
              <span>Public Directory Scraper Engine</span>
            </h3>
            <p className="text-xs text-[#74778A]">
              Complies with robots.txt, rate limits (2 req/s), and public business records only.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartCollection}
              disabled={isCollecting}
              className="mira-btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isCollecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Collecting Records...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Collection Job</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="flex-1 w-full">
            <label className="text-[11px] font-semibold text-[#74778A] block mb-1">Target Public Directory URL</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="mira-input text-xs"
              placeholder="https://public-directory.health.gov.au/providers"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="text-[11px] font-semibold text-[#74778A] block mb-1">Jurisdiction / State</label>
            <div className="p-2 rounded-lg bg-[#F8F8FC] border border-[#DFDEEB] text-xs font-medium text-[#25283A]">
              All Australia (QLD, NSW, VIC...)
            </div>
          </div>
        </div>

        {lastCollectedCount !== null && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Scrape job completed successfully! Extracted and normalized {lastCollectedCount} public provider records with source tracking.
            </span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9699AA] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search providers by clinic, practitioner, suburb, state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mira-input pl-9 text-xs"
          />
        </div>
        <span className="text-xs text-[#74778A] font-medium">
          {filteredProviders.length} providers in database
        </span>
      </div>

      {/* Provider Registry Table */}
      <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="mira-table">
            <thead>
              <tr>
                <th>Clinic / Practice</th>
                <th>Practitioner / Specialty</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Source URL</th>
                <th>Collected At</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((prv) => (
                <tr key={prv.id}>
                  <td>
                    <div className="font-semibold text-xs text-[#25283A]">{prv.clinicName}</div>
                    {prv.website && (
                      <a
                        href={prv.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#6BA3E8] hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {prv.website.replace("https://", "")} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </td>
                  <td>
                    <div className="text-xs font-medium text-[#25283A]">
                      {prv.providerName || "General Practitioner"}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E9E8F8] text-[#25283A]">
                      {prv.category || "General Practice"}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs text-[#25283A]">{prv.suburb || "CBD"}, {prv.state || "NSW"}</div>
                    <div className="text-[10px] text-[#74778A] truncate max-w-xs">{prv.address}</div>
                  </td>
                  <td className="text-xs text-[#25283A]">
                    <div>{prv.phone || "—"}</div>
                    <div className="text-[11px] text-[#74778A]">{prv.email || "—"}</div>
                  </td>
                  <td>
                    {prv.sourceUrl ? (
                      <a
                        href={prv.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#74778A] hover:text-[#25283A] truncate max-w-[140px] block font-mono"
                      >
                        {prv.sourceUrl}
                      </a>
                    ) : (
                      <span className="text-[#9699AA] text-[11px]">Direct</span>
                    )}
                  </td>
                  <td className="text-xs text-[#74778A]">
                    {new Date(prv.collectedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

