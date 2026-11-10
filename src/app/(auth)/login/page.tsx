"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/constants";
import {
  Sparkles,
  Lock,
  Mail,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("sarah.mitchell@miraops.health");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedRole, setSelectedRole] = useState<string>(ROLES[1].value);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const quickFillRole = (roleValue: string) => {
    setSelectedRole(roleValue);
    if (roleValue === "super_admin") {
      setEmail("admin@miraops.health");
    } else if (roleValue === "healthcare_admin") {
      setEmail("sarah.mitchell@miraops.health");
    } else if (roleValue === "data_coordinator") {
      setEmail("coordinator@miraops.health");
    } else if (roleValue === "operations_executive") {
      setEmail("ops.lead@miraops.health");
    } else {
      setEmail("viewer@miraops.health");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FC] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#8DB9F0] text-white shadow-sm mb-1">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#25283A] tracking-tight">
            MIRA Ops Intelligence
          </h1>
          <p className="text-xs text-[#74778A]">
            Intelligent Healthcare Operations, Powered by AI
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-7 rounded-2xl border border-[#DFDEEB] shadow-sm space-y-5">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="mira-label">Healthcare Operator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9699AA] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mira-input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="mira-label">Security Credential / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9699AA] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mira-input pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#8DB9F0] text-white font-semibold hover:bg-[#6BA3E8] transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Access Operations Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Role Quick Selector for Demonstrations */}
          <div className="pt-4 border-t border-[#DFDEEB] space-y-2">
            <div className="text-[11px] font-semibold text-[#74778A] uppercase tracking-wider text-center">
              Demo Access Role Quick-Fill
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {ROLES.slice(0, 4).map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => quickFillRole(role.value)}
                  className={`p-2 rounded-lg border text-left transition ${
                    selectedRole === role.value
                      ? "border-[#8DB9F0] bg-[#E9E8F8] font-semibold text-[#25283A]"
                      : "border-[#DFDEEB] bg-[#F8F8FC] text-[#74778A] hover:bg-white"
                  }`}
                >
                  <div className="text-[11px] truncate">{role.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <p className="text-[11px] text-[#9699AA] text-center max-w-sm mx-auto leading-relaxed">
          Independent healthcare technology prototype inspired by public healthcare automation challenges. Not an official Gokul Infocare product.
        </p>
      </div>
    </div>
  );
}
