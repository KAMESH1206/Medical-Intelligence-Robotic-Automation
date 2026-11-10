import { readFile } from "fs/promises";
import path from "path";
import { cacheLife } from "next/cache";
import type { Practice } from "@/lib/types";
import { computeStats } from "@/lib/utils";
import StatsCards from "@/components/StatsCards";
import PracticesTable from "@/components/PracticesTable";
import Charts from "@/components/Charts";
import AIChatPanel from "@/components/AIChatPanel";

async function getPractices(): Promise<Practice[]> {
  "use cache";
  cacheLife("days");
  const dataPath = path.join(process.cwd(), "data", "practices.json");
  const json = await readFile(dataPath, "utf-8");
  return JSON.parse(json);
}

export default async function DashboardPage() {
  const practices = await getPractices();
  const stats = computeStats(practices);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">MediLead AI</h1>
              <p className="text-xs text-gray-500">Healthcare Practice Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              🇦🇺 Australia
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
              AI Powered
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
        {/* Page title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Practice Pipeline</h2>
          <p className="text-sm text-gray-500 mt-1">
            Identify, score, and reach out to Australian medical practices ready for AI automation.
          </p>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Charts */}
        <Charts practices={practices} />

        {/* Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Practices</h3>
          <PracticesTable practices={practices} />
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center pb-4">
          MediLead AI · Built with Next.js 16 + Claude AI · Practice data for demonstration purposes
        </p>
      </main>

      {/* Floating AI Chat */}
      <AIChatPanel />
    </div>
  );
}
