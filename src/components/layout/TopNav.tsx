"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMiraStore } from "@/lib/store";
import { ROLES, ROLE_PERMISSIONS } from "@/lib/constants";
import type { Role } from "@/lib/types";
import {
  Bell,
  Shield,
  ChevronDown,
  UserCheck,
  LogOut,
  HelpCircle,
} from "lucide-react";

export default function TopNav({ title }: { title?: string }) {
  const router = useRouter();
  const { currentUser, setRole, validationIssues, logout } = useMiraStore();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [roleToast, setRoleToast] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const currentRoleObj = ROLES.find((r) => r.value === currentUser.role) || ROLES[1];
  const currentRolePerm = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.healthcare_admin;

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setRoleDropdownOpen(false);
    const cfg = ROLE_PERMISSIONS[newRole];
    setRoleToast(`Permissions Updated: ${cfg.label} Active • ${cfg.scopeSummary}`);
    setTimeout(() => setRoleToast(null), 5000);
  };

  return (
    <>
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
          {/* Help & System Documentation */}
          <Link
            href="/settings"
            className="p-2 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#F8F8FC] hover:text-[#25283A] transition"
            title="System Architecture & Settings"
          >
            <HelpCircle className="w-4 h-4" />
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#F8F8FC] relative transition cursor-pointer"
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

          {/* Dynamic Role Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DFDEEB] bg-white hover:bg-[#F8F8FC] transition text-xs font-medium text-[#25283A] cursor-pointer"
              title="Click to switch role permissions"
            >
              <Shield className="w-3.5 h-3.5" style={{ color: currentRolePerm.color }} />
              <span className="hidden lg:inline text-[#74778A]">Role:</span>
              <span
                className="px-2 py-0.5 rounded-md font-bold text-[11px] transition-all"
                style={{ backgroundColor: `${currentRolePerm.color}20`, color: currentRolePerm.color }}
              >
                {currentRoleObj.label}
              </span>
              <ChevronDown className="w-3 h-3 text-[#74778A]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-[#DFDEEB] py-1.5 z-50 animate-in fade-in">
                <div className="px-3.5 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-[#9699AA] border-b border-[#DFDEEB]">
                  Switch Active Role & Permissions
                </div>
                {ROLES.map((role) => {
                  const perms = ROLE_PERMISSIONS[role.value as Role];
                  const isSelected = currentUser.role === role.value;
                  return (
                    <button
                      key={role.value}
                      onClick={() => handleRoleChange(role.value as Role)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs transition border-b border-[#DFDEEB]/40 last:border-0 cursor-pointer ${
                        isSelected
                          ? "bg-[#E9E8F8] font-semibold text-[#25283A]"
                          : "text-[#74778A] hover:bg-[#F8F8FC]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#25283A]">{role.label}</span>
                        {isSelected && <UserCheck className="w-3.5 h-3.5 text-[#8DB9F0]" />}
                      </div>
                      <div className="text-[10px] text-[#74778A] mt-0.5 leading-snug">
                        {perms.scopeSummary}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Profile & Logout Menu */}
          <div className="relative pl-2 border-l border-[#DFDEEB]">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F8F8FC] transition text-left cursor-pointer"
              title="Account & Session Controls"
            >
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
              <ChevronDown className="w-3 h-3 text-[#74778A] hidden xl:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-[#DFDEEB] py-2 z-50 animate-in fade-in">
                <div className="px-3.5 py-2 border-b border-[#DFDEEB] bg-[#F8F8FC]/50">
                  <div className="text-xs font-bold text-[#25283A]">{currentUser.name}</div>
                  <div className="text-[11px] text-[#74778A] truncate">{currentUser.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E9E8F8] text-[#25283A]">
                    <Shield className="w-2.5 h-2.5 text-[#8DB9F0]" />
                    <span>{currentRoleObj.label}</span>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-[#D65B62] hover:bg-[#FDDCDE]/40 transition flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#D65B62]" />
                    <span>Log Out of Operations</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct One-Click Logout Icon Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:text-[#D65B62] hover:border-[#F5B69E] hover:bg-[#FDDCDE]/20 transition cursor-pointer"
            title="Sign Out / Exit Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Dynamic Role Change Alert Banner */}
      {roleToast && (
        <div className="bg-[#25283A] text-white px-6 py-2.5 text-xs flex items-center justify-between shadow-md z-30 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#8DB9F0] animate-ping" />
            <span className="font-semibold text-[#8DB9F0]">{currentRoleObj.label}:</span>
            <span className="text-gray-200">{roleToast}</span>
          </div>
          <button
            onClick={() => setRoleToast(null)}
            className="text-[11px] text-[#9699AA] hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
