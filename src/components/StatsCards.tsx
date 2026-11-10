import type { DashboardStats } from "@/lib/types";

type Props = {
  stats: DashboardStats;
};

type StatCard = {
  label: string;
  value: string | number;
  sub: string;
  icon: string;
  color: string;
};

export default function StatsCards({ stats }: Props) {
  const cards: StatCard[] = [
    {
      label: "Total Practices",
      value: stats.total,
      sub: "in pipeline",
      icon: "🏥",
      color: "bg-blue-50 border-blue-200",
    },
    {
      label: "Avg AI Score",
      value: stats.avgScore || "—",
      sub: "out of 100",
      icon: "🤖",
      color: "bg-purple-50 border-purple-200",
    },
    {
      label: "Contacted",
      value: stats.contacted,
      sub: `${Math.round((stats.contacted / stats.total) * 100) || 0}% outreach rate`,
      icon: "📤",
      color: "bg-amber-50 border-amber-200",
    },
    {
      label: "Replied",
      value: stats.replied,
      sub: "warm leads",
      icon: "✅",
      color: "bg-emerald-50 border-emerald-200",
    },
    {
      label: "High Fit (70+)",
      value: stats.highFit,
      sub: "top prospects",
      icon: "⭐",
      color: "bg-rose-50 border-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 ${card.color}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
            <span className="text-2xl">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
