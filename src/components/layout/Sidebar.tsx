"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMiraStore } from "@/lib/store";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldCheck,
  Calendar,
  Building2,
  Bot,
  GitBranch,
  BarChart3,
  FlaskConical,
  ShieldAlert,
  Settings,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patient Intake", href: "/patients", icon: Users },
  { label: "Document AI", href: "/documents", icon: FileText },
  { label: "Data Quality", href: "/data-quality", icon: ShieldCheck },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Provider Intel", href: "/providers", icon: Building2 },
  { label: "AI Assistant", href: "/ai-assistant", icon: Bot },
  { label: "Workflows", href: "/automation", icon: GitBranch },
  { label: "Analytics & Reports", href: "/analytics", icon: BarChart3 },
  { label: "Prompt Lab", href: "/prompt-lab", icon: FlaskConical },
  { label: "Audit & Security", href: "/audit-logs", icon: ShieldAlert },
  { label: "System Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useMiraStore();
  const perms = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.healthcare_admin;

  return (
    <aside className="w-64 border-r border-[#DFDEEB] bg-[#E9E8F8]/40 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#DFDEEB] flex items-center gap-3 bg-white/70">
        <div className="w-9 h-9 rounded-xl bg-[#8DB9F0] flex items-center justify-center text-white font-bold shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-[#25283A]">
              MIRA Ops
            </span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#F5B69E]/30 text-[#EE9478]">
              SaaS
            </span>
          </div>
          <p className="text-[11px] text-[#74778A] font-medium leading-none mt-0.5">
            Healthcare Intelligence
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9699AA]">
            Modules
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.2 rounded"
            style={{ backgroundColor: `${perms.color}20`, color: perms.color }}
          >
            {perms.label}
          </span>
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isAllowed = perms.allowedRoutes.includes(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#8DB9F0] text-white shadow-sm font-semibold"
                  : isAllowed
                  ? "text-[#74778A] hover:bg-[#E9E8F8] hover:text-[#25283A]"
                  : "text-[#9699AA]/60 hover:bg-white/50"
              }`}
              title={
                !isAllowed
                  ? `Restricted: Requires higher authority than ${perms.label}`
                  : item.label
              }
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? "text-white"
                    : isAllowed
                    ? "text-[#74778A]"
                    : "text-[#9699AA]/50"
                }`}
              />
              <span className="truncate">{item.label}</span>
              {!isAllowed && (
                <Lock className="w-3 h-3 text-[#9699AA] ml-auto shrink-0 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer & Status */}
      <div className="p-3 border-t border-[#DFDEEB] bg-white/60 text-[11px] text-[#74778A] space-y-2">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-[#6BA3E8] hover:underline font-medium"
          >
            Landing Page <ExternalLink className="w-3 h-3" />
          </Link>
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#248A63] text-[10px] font-semibold">
            Operations Active
          </span>
        </div>
      </div>
    </aside>
  );
}
