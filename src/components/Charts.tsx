"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { Practice } from "@/lib/types";

type Props = {
  practices: Practice[];
};

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  contacted: "#a855f7",
  replied: "#10b981",
  not_interested: "#9ca3af",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  not_interested: "Not Interested",
};

export default function Charts({ practices }: Props) {
  // Score distribution
  const scoreData = [
    { range: "0–24", count: practices.filter((p) => (p.fitScore ?? -1) >= 0 && (p.fitScore ?? -1) < 25).length },
    { range: "25–49", count: practices.filter((p) => (p.fitScore ?? -1) >= 25 && (p.fitScore ?? -1) < 50).length },
    { range: "50–69", count: practices.filter((p) => (p.fitScore ?? -1) >= 50 && (p.fitScore ?? -1) < 70).length },
    { range: "70–84", count: practices.filter((p) => (p.fitScore ?? -1) >= 70 && (p.fitScore ?? -1) < 85).length },
    { range: "85–100", count: practices.filter((p) => (p.fitScore ?? -1) >= 85).length },
  ];

  // Status breakdown
  const statusData = ["new", "contacted", "replied", "not_interested"].map(
    (s) => ({
      name: STATUS_LABELS[s],
      value: practices.filter((p) => p.status === s).length,
      color: STATUS_COLORS[s],
    })
  );

  // State distribution
  const stateMap: Record<string, number> = {};
  practices.forEach((p) => {
    stateMap[p.state] = (stateMap[p.state] || 0) + 1;
  });
  const stateData = Object.entries(stateMap)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Score Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Score Distribution</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={scoreData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Pie */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Pipeline Status</h3>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              dataKey="value"
            >
              {statusData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: 11 }}>{value}</span>
              )}
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* State Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Practices by State</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={stateData}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="state" tick={{ fontSize: 10 }} width={30} />
            <Tooltip />
            <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

