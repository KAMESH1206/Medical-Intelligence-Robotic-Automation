"use client";

import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import {
  Building2,
  Globe,
  Play,
  Download,
  Search,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function ProvidersPage() {
  const { providers, collectProviders, deleteProvider, clearProviders } = useMiraStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollecting, setIsCollecting] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("https://www.msh.org.in/");
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
    a.download = `mira_providers_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#25283A]">Healthcare Provider Intelligence</h2>
          <p className="text-xs text-[#74778A]">
            Autonomous multi-page crawler, medical directory scraping, and AI doctor verification engine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {providers.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all provider records?")) {
                  clearProviders();
                  setLastCollectedCount(null);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-xs font-medium text-rose-700 transition"
              title="Clear all provider records from database"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={exportCSV}
            disabled={filteredProviders.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DFDEEB] bg-white hover:bg-[#F8F8FC] text-xs font-medium text-[#25283A] transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#74778A]" />
            <span>Export Provider CSV</span>
          </button>
        </div>
      </div>

      {/* Scraper Collector Control Panel */}
      <div className="p-5 rounded-2xl bg-white border border-[#DFDEEB] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#DFDEEB] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#25283A] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#8DB9F0]" />
              <span>Deep Multi-Page Directory Scraper Engine</span>
            </h3>
            <p className="text-xs text-[#74778A]">
              Autonomous sub-page discovery (doctors, departments, specialties), robots.txt compliant, real-time AI parsing.
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
                  <span>Deep Crawling Website & Doctors...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Deep Collection Job</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="flex-1 w-full">
            <label className="text-[11px] font-semibold text-[#74778A] block mb-1">Target Healthcare Website / Directory URL</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="mira-input text-xs font-mono"
              placeholder="e.g. https://www.msh.org.in or https://healthengine.com.au"
            />
          </div>
          <div className="w-full sm:w-56">
            <label className="text-[11px] font-semibold text-[#74778A] block mb-1">Target Jurisdiction / Region</label>
            <div className="p-2 rounded-lg bg-[#F8F8FC] border border-[#DFDEEB] text-xs font-medium text-[#25283A] flex items-center justify-between">
              <span>Auto-Detect / Global (India, AU, UK...)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </div>

        {lastCollectedCount !== null && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Deep scrape completed successfully! Crawled doctor sub-pages and extracted {lastCollectedCount} verified medical practitioner records with full attribution.
            </span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#9699AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search providers by clinic, practitioner, suburb, state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mira-input mira-input-search text-xs w-full"
            style={{ paddingLeft: "42px" }}
          />
        </div>
        <span className="text-xs text-[#74778A] font-medium shrink-0">
          {filteredProviders.length} providers in database
        </span>
      </div>

      {/* Provider Registry Table & Mobile Cards */}
      <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
        {filteredProviders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-xs text-[#74778A] space-y-3">
            <Building2 className="w-8 h-8 text-[#9699AA] mx-auto opacity-50" />
            <div className="font-semibold text-sm text-[#25283A]">No Provider Records Found</div>
            <p className="max-w-md mx-auto text-[11px]">
              Target website URL enter panni <strong>Start Deep Collection Job</strong> click pannunga. Doctor sub-pages crawl panni verified medical practitioners inga automatically extract aagi varum.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="mira-table">
                <thead>
                  <tr>
                    <th>Clinic / Practice</th>
                    <th>Practitioner / Specialty</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Source URL</th>
                    <th>Collected At</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((prv) => (
                    <tr key={prv.id} className="hover:bg-[#FAF9FF] transition">
                      <td>
                        <div className="font-semibold text-xs text-[#25283A]">{prv.clinicName}</div>
                        {prv.website && (
                          <a
                            href={prv.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#6BA3E8] hover:underline flex items-center gap-1 mt-0.5"
                          >
                            {prv.website.replace(/^https?:\/\//, "")} <ExternalLink className="w-2.5 h-2.5" />
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
                        <div className="text-xs text-[#25283A]">
                          {prv.suburb ? `${prv.suburb}, ` : ""}{prv.state || ""}
                        </div>
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
                      <td className="text-right">
                        <button
                          onClick={() => deleteProvider(prv.id)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-[#9699AA] hover:text-rose-600 transition"
                          title="Delete this provider"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden divide-y divide-[#DFDEEB]">
              {filteredProviders.map((prv) => (
                <div key={prv.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#25283A]">{prv.clinicName}</div>
                      {prv.website && (
                        <a
                          href={prv.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#6BA3E8] hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {prv.website.replace(/^https?:\/\//, "")} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => deleteProvider(prv.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition shrink-0"
                      title="Delete provider"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#25283A]">
                      {prv.providerName || "General Practitioner"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E9E8F8] text-[#25283A] font-medium">
                      {prv.category || "General Practice"}
                    </span>
                  </div>

                  {prv.address && (
                    <div className="text-xs text-[#74778A] bg-[#F8F8FC] p-2 rounded-lg border border-[#DFDEEB]/60">
                      <div className="font-semibold text-[#25283A] text-[11px]">
                        {prv.suburb ? `${prv.suburb}, ` : ""}{prv.state || ""}
                      </div>
                      <div className="text-[11px] text-[#74778A] mt-0.5">{prv.address}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="space-y-0.5">
                      {prv.phone && (
                        <div>
                          <a href={`tel:${prv.phone}`} className="text-[#6BA3E8] font-medium hover:underline">
                            {prv.phone}
                          </a>
                        </div>
                      )}
                      {prv.email && (
                        <div className="text-[11px] text-[#74778A]">{prv.email}</div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#9699AA]">
                      {new Date(prv.collectedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
