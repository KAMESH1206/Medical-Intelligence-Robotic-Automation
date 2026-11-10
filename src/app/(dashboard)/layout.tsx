"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import { MiraStoreProvider } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MiraStoreProvider>
      <div className="flex min-h-screen bg-[#F8F8FC]">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          <main className="flex-1 p-6 overflow-y-auto page-enter">
            {children}
          </main>
        </div>
      </div>
    </MiraStoreProvider>
  );
}
