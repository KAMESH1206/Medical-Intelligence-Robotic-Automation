"use client";

import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import { ROLES } from "@/lib/constants";
import type { Role } from "@/lib/types";
import {
  Bell,
  Shield,
  ChevronDown,
  UserCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function TopNav({ title }: { title?: string }) {
  const { currentUser, setRole, resetDemoData, validationIssues } = useMiraStore();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentRoleObj = ROLES.find((r) => r.value === currentUser.role) || ROLES[1];

  return (
    <header className="h-[60px] border-b border-[#DFDEEB] bg-white sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Title & Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-[#25283A]">{title || "Operations"}</h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E9E8F8] text-[#25283A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8DB9F0] animate-pulse"></span>
          Intelligent Operations Engine
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (confirm("Reset application data back to default synthetic demo state?")) {
              resetDemoData();
            }
          }}
          className="hidden md:flex items-center gap-1.5 text-xs text-[#74778A] hover:text-[#25283A] px-2.5 py-1.5 rounded-lg border border-[#DFDEEB] bg-[#F8F8FC] hover:bg-[#E9E8F8] transition"
          title="Reset back to synthetic seed dataset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#F8F8FC] relative transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {validationIssues.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F5B69E] text-white text-[10px] font-bold flex items-center justify-center">
                {validationIssues.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#DFDEEB] p-3 text-xs z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#DFDEEB] mb-2 font-semibold text-[#25283A]">
                <span>Quality & Review Alerts</span>
                <span className="px-1.5 py-0.5 rounded bg-[#F5B69E]/30 text-[#EE9478] font-bold text-[10px]">
                  {validationIssues.length} Pending
                </span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {validationIssues.length === 0 ? (
                  <p className="text-gray-400 py-3 text-center">No active alerts.</p>
                ) : (
                  validationIssues.map((issue) => (
                    <div key={issue.id} className="p-2 rounded-lg bg-[#F8F8FC] border border-[#DFDEEB]">
                      <div className="font-medium text-[#25283A]">{issue.field}</div>
                      <div className="text-[11px] text-[#74778A]">{issue.issue}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DFDEEB] bg-white hover:bg-[#F8F8FC] transition text-xs font-medium text-[#25283A]"
          >
            <Shield className="w-3.5 h-3.5 text-[#8DB9F0]" />
            <span className="hidden lg:inline text-[#74778A]">Role:</span>
            <span className="font-semibold">{currentRoleObj.label}</span>
            <ChevronDown className="w-3 h-3 text-[#74778A]" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-[#DFDEEB] py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-[#9699AA] border-b border-[#DFDEEB]">
                Switch Active Role
              </div>
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  onClick={() => {
                    setRole(role.value as Role);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                    currentUser.role === role.value
                      ? "bg-[#E9E8F8] font-semibold text-[#25283A]"
                      : "text-[#74778A] hover:bg-[#F8F8FC]"
                  }`}
                >
                  <span>{role.label}</span>
                  {currentUser.role === role.value && (
                    <UserCheck className="w-3.5 h-3.5 text-[#8DB9F0]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#DFDEEB]">
          <div className="w-8 h-8 rounded-full bg-[#8DB9F0] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {currentUser.avatar || "SM"}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-[#25283A] leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-[#74778A] leading-tight">
              {currentUser.email}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
