"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import DemoGuideModal from "@/components/layout/DemoGuideModal";
import { useMiraStore } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAuthLoading } = useMiraStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  return (
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

      {/* Floating Operations Reference Guide */}
      <DemoGuideModal />
    </div>
  );
}

