"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMiraStore } from "@/lib/store";
import { ROLES } from "@/lib/constants";
import type { Role } from "@/lib/types";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Building2,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  LogIn,
  UserPlus,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup } = useMiraStore();

  // Mode: "signin" or "signup"
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Sign In Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("healthcare_admin");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("tab") === "signup") {
      setMode("signup");
    }
  }, [searchParams]);

  // Handle Sign In Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const res = await login(email, password);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Authentication failed. Please verify credentials.");
      setLoading(false);
    }
  };

  // Handle Sign Up Submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (regPassword !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters in length.");
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError("Please confirm compliance authorization to access clinical operations.");
      setLoading(false);
      return;
    }

    const res = await signup({
      name: fullName,
      email: workEmail,
      password: regPassword,
      role: selectedRole,
      organization: organization || "Healthcare Operations Facility",
    });

    if (res.success) {
      setSuccessMessage("Account created successfully. Redirecting to Command Center...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } else {
      setError(res.error || "Failed to create account. Please check details.");
      setLoading(false);
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
            Intelligent Healthcare Operations & Workflow Automation
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white p-7 rounded-2xl border border-[#DFDEEB] shadow-sm space-y-5">
          {/* Sign In vs Sign Up Segmented Tab Controls */}
          <div className="grid grid-cols-2 p-1 bg-[#E9E8F8] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "signin"
                  ? "bg-white text-[#25283A] shadow-xs"
                  : "text-[#74778A] hover:text-[#25283A]"
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-[#8DB9F0]" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "signup"
                  ? "bg-white text-[#25283A] shadow-xs"
                  : "text-[#74778A] hover:text-[#25283A]"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-[#8DB9F0]" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="p-3 rounded-xl bg-[#FDDCDE] border border-[#F5B69E] flex items-center gap-2.5 text-xs text-[#D65B62]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-[#D6F5EC] border border-[#248A63]/30 flex items-center gap-2.5 text-xs text-[#248A63]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE 1: SIGN IN FORM */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#25283A] block">
                  Healthcare Operator Email
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9699AA] z-10">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: "42px", paddingRight: "16px" }}
                    className="w-full py-2.5 rounded-xl border border-[#DFDEEB] bg-white text-sm text-[#25283A] outline-none focus:border-[#8DB9F0] focus:ring-2 focus:ring-[#8DB9F0]/20 transition placeholder:text-[#9699AA]"
                    placeholder="operator@miraops.health"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#25283A] block">
                    Security Credential / Password
                  </label>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9699AA] z-10">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: "42px", paddingRight: "42px" }}
                    className="w-full py-2.5 rounded-xl border border-[#DFDEEB] bg-white text-sm text-[#25283A] outline-none focus:border-[#8DB9F0] focus:ring-2 focus:ring-[#8DB9F0]/20 transition placeholder:text-[#9699AA]"
                    placeholder="Enter security password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#9699AA] hover:text-[#25283A] transition p-1 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#74778A]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#DFDEEB] text-[#8DB9F0] focus:ring-[#8DB9F0]"
                  />
                  <span>Remember this terminal</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link has been dispatched to your institutional medical administrator.")}
                  className="text-[#8DB9F0] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#8DB9F0] text-white font-semibold hover:bg-[#6BA3E8] transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Clinical Access...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Operations</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: SIGN UP / REGISTRATION FORM */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#25283A] block">
                  Full Professional Name
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9699AA] z-10">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ paddingLeft: "42px", paddingRight: "16px" }}
                    className="w-full py-2.5 rounded-xl border border-[#DFDEEB] bg-white text-sm text-[#25283A] outline-none focus:border-[#8DB9F0] focus:ring-2 focus:ring-[#8DB9F0]/20 transition placeholder:text-[#9699AA]"
                    placeholder="e.g. Dr. Priya Sharma"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#25283A] block">
                  Healthcare Work Email
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9699AA] z-10">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    style={{ paddingLeft: "42px", paddingRight: "16px" }}
                    className="w-full py-2.5 rounded-xl border border-[#DFDEEB] bg-white text-sm text-[#25283A] outline-none focus:border-[#8DB9F0] focus:ring-2 focus:ring-[#8DB9F0]/20 transition placeholder:text-[#9699AA]"
                    placeholder="priya.sharma@healthcenter.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#25283A] block">
                    Institutional Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Role)}
                    className="w-full py-2.5 px-3 rounded-xl border border-[#DFDEEB] bg-white text-xs text-[#25283A] outline-none focus:border-[#8DB9F0] focus:ring-2 focus:ring-[#8DB9F0]/20 transition"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#25283A] block">
                    Facility / Hospital
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center justify-center pointer-events-none text-[#9699AA] z-10">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      style={{ paddingLeft: "32px", paddingRight: "12px" }}
                      className="w-full py-2.5 rounded-xl border border-[#DFDEEB] bg-white text-xs text-[#25283A] outline-none focus:border-[#8DB9F0] focus:ring-2 focus:ring-[#8DB9F0]/20 transition placeholder:text-[#9699AA]"
                      placeholder="Royal Hospital"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#25283A] block">
                  Create Security Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9699AA] z-10">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: "42px", paddingRight: "42px" }}
                    className="w-full py-2.5 rounded-xl border border-[#DFDEEB] bg-white text-sm text-[#25283A] outline-none focus:border-[#8DB9F0] focus:ring-2 focus:ring-[#8DB9F0]/20 transition placeholder:text-[#9699AA]"
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 text-[#9699AA] hover:text-[#25283A] transition p-1 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#25283A] block">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9699AA] z-10">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: "42px", paddingRight: "16px" }}
                    className="w-full py-2.5 rounded-xl border border-[#DFDEEB] bg-white text-sm text-[#25283A] outline-none focus:border-[#8DB9F0] focus:ring-2 focus:ring-[#8DB9F0]/20 transition placeholder:text-[#9699AA]"
                    placeholder="Re-type password"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#DFDEEB] text-[#8DB9F0] focus:ring-[#8DB9F0]"
                />
                <span className="text-[11px] text-[#74778A] leading-tight">
                  I certify authorization to access clinical operations infrastructure in accordance with Australian Privacy Principles and healthcare data governance.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#8DB9F0] text-white font-semibold hover:bg-[#6BA3E8] transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Registering Healthcare Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Healthcare Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security & Compliance Footer */}
        <div className="text-[11px] text-[#74778A] text-center max-w-sm mx-auto space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-medium text-[#25283A]">
            <Shield className="w-3.5 h-3.5 text-[#8DB9F0]" />
            <span>Enterprise Healthcare Operations Network</span>
          </div>
          <p>
            Protected by 256-Bit TLS End-to-End Encryption • Fully Compliant with Australian Privacy Act & HIPAA Security Guidelines
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F8FC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#8DB9F0] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
