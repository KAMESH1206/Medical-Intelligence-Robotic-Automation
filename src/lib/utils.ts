import type { Practice } from "./types";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

export function getScoreBadge(score: number): string {
  if (score >= 75) return "bg-emerald-100 text-emerald-800";
  if (score >= 50) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export function getStatusBadge(status: Practice["status"]): string {
  const map: Record<Practice["status"], string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-purple-100 text-purple-800",
    replied: "bg-green-100 text-green-800",
    not_interested: "bg-gray-100 text-gray-600",
  };
  return map[status];
}

export function getStatusLabel(status: Practice["status"]): string {
  const map: Record<Practice["status"], string> = {
    new: "New",
    contacted: "Contacted",
    replied: "Replied",
    not_interested: "Not Interested",
  };
  return map[status];
}

export function computeStats(practices: Practice[]) {
  const total = practices.length;
  const scored = practices.filter((p) => p.fitScore !== undefined);
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((s, p) => s + (p.fitScore ?? 0), 0) / scored.length
        )
      : 0;
  const contacted = practices.filter(
    (p) => p.status === "contacted" || p.status === "replied"
  ).length;
  const replied = practices.filter((p) => p.status === "replied").length;
  const highFit = practices.filter((p) => (p.fitScore ?? 0) >= 70).length;
  return { total, avgScore, contacted, replied, highFit };
}

