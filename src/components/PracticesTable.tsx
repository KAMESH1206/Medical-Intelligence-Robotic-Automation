"use client";

import { useState, useCallback } from "react";
import type { Practice, PracticeStatus } from "@/lib/types";
import {
  getScoreBadge,
  getStatusBadge,
  getStatusLabel,
} from "@/lib/utils";

type Props = {
  practices: Practice[];
};

const STATES = ["QLD", "NSW", "VIC", "SA", "WA", "TAS", "NT", "ACT"];
const STATUSES: PracticeStatus[] = [
  "new",
  "contacted",
  "replied",
  "not_interested",
];

export default function PracticesTable({ practices }: Props) {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "score" | "status">("score");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scoring, setScoring] = useState<string | null>(null);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [localPractices, setLocalPractices] = useState<Practice[]>(practices);
  const [draftModal, setDraftModal] = useState<{
    subject: string;
    body: string;
    practiceName: string;
  } | null>(null);

  const filtered = localPractices
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.suburb.toLowerCase().includes(q) ||
        p.postcode.includes(q);
      const matchState = stateFilter === "all" || p.state === stateFilter;
      const matchStatus =
        statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchState && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "score")
        return (b.fitScore ?? -1) - (a.fitScore ?? -1);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.status.localeCompare(b.status);
    });

  const handleScore = useCallback(
    async (practice: Practice) => {
      setScoring(practice.id);
      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(practice),
        });
        const data = await res.json();
        setLocalPractices((prev) =>
          prev.map((p) =>
            p.id === practice.id
              ? { ...p, fitScore: data.score, scoreReason: data.reason }
              : p
          )
        );
        setSelectedId(practice.id);
      } finally {
        setScoring(null);
      }
    },
    []
  );

  const handleDraft = useCallback(async (practice: Practice) => {
    setDrafting(practice.id);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(practice),
      });
      const data = await res.json();
      setDraftModal({
        subject: data.subject,
        body: data.body,
        practiceName: practice.name,
      });
    } finally {
      setDrafting(null);
    }
  }, []);

  const handleStatusChange = useCallback(
    (id: string, status: PracticeStatus) => {
      setLocalPractices((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
    },
    []
  );

  const selectedPractice = selectedId
    ? localPractices.find((p) => p.id === selectedId)
    : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search practice, suburb, postcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All States</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(s)}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "name" | "score" | "status")
          }
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="score">Sort: Score</option>
          <option value="name">Sort: Name</option>
          <option value="status">Sort: Status</option>
        </select>
        <span className="text-sm text-gray-500">
          {filtered.length} of {localPractices.length} practices
        </span>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Practice</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Location</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">AI Score</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50 ${
                    selectedId === p.id ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.services?.slice(0, 2).join(" · ")}
                      {(p.services?.length ?? 0) > 2 &&
                        ` +${(p.services?.length ?? 0) - 2}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.suburb}, {p.state}
                  </td>
                  <td className="px-4 py-3">
                    {p.fitScore !== undefined ? (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getScoreBadge(
                          p.fitScore
                        )}`}
                      >
                        {p.fitScore}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Not scored</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleStatusChange(p.id, e.target.value as PracticeStatus)
                      }
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusBadge(
                        p.status
                      )}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {getStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleScore(p)}
                        disabled={scoring === p.id}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 transition-colors font-medium"
                      >
                        {scoring === p.id ? "Scoring…" : "AI Score"}
                      </button>
                      <button
                        onClick={() => handleDraft(p)}
                        disabled={drafting === p.id}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 transition-colors font-medium"
                      >
                        {drafting === p.id ? "Drafting…" : "Draft Email"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No practices match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selectedPractice && (
          <div className="w-80 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4 h-fit">
            <div>
              <h3 className="font-bold text-gray-900">{selectedPractice.name}</h3>
              <p className="text-sm text-gray-500">
                {selectedPractice.suburb}, {selectedPractice.state}{" "}
                {selectedPractice.postcode}
              </p>
            </div>
            {selectedPractice.phone && (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Phone</span>
                <p className="text-sm text-gray-700">{selectedPractice.phone}</p>
              </div>
            )}
            {selectedPractice.email && (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Email</span>
                <p className="text-sm text-gray-700">{selectedPractice.email}</p>
              </div>
            )}
            {selectedPractice.website && (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Website</span>
                <a
                  href={selectedPractice.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {selectedPractice.website.replace("https://", "")}
                </a>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Services</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedPractice.services?.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Team</span>
                <p className="capitalize text-gray-700">
                  {selectedPractice.teamSizeEstimate || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Practitioners</span>
                <p className="text-gray-700">
                  {selectedPractice.practitionerCount ?? "—"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Telehealth</span>
                <p className="text-gray-700">
                  {selectedPractice.telehealth ? "✅ Yes" : "❌ No"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Bulk Billing</span>
                <p className="text-gray-700">
                  {selectedPractice.bulkBilling ? "✅ Yes" : "❌ No"}
                </p>
              </div>
            </div>
            {selectedPractice.fitScore !== undefined && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">AI Fit Score</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${getScoreBadge(
                      selectedPractice.fitScore
                    )}`}
                  >
                    {selectedPractice.fitScore}/100
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedPractice.scoreReason}
                </p>
              </div>
            )}
            {selectedPractice.notes && (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Notes</span>
                <p className="text-sm text-gray-700 mt-1">{selectedPractice.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Draft Email Modal */}
      {draftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">AI-Drafted Email</h3>
                <p className="text-sm text-gray-500">For {draftModal.practiceName}</p>
              </div>
              <button
                onClick={() => setDraftModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Subject
                </label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-800">
                  {draftModal.subject}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Body
                </label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {draftModal.body}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Subject: ${draftModal.subject}\n\n${draftModal.body}`
                  );
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setDraftModal(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
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
