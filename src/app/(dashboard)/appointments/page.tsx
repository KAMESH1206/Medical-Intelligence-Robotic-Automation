"use client";


import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import { CLINIC_LOCATIONS } from "@/lib/constants";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  User,
  X,
  Mail,
  MailCheck,
  Send,
  Check,
} from "lucide-react";

interface DispatchedEmail {
  to: string;
  cc: string;
  subject: string;
  body: string;
  sentAt: string;
  appointmentId: string;
  patientName: string;
  clinicName: string;
}

export default function AppointmentsPage() {
  const { appointments, addAppointment, updateAppointmentStatus, patients, providers, runWorkflow } = useMiraStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isCustomClinic, setIsCustomClinic] = useState(false);
  const [customClinic, setCustomClinic] = useState("");
  const [activeEmail, setActiveEmail] = useState<DispatchedEmail | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailToast, setEmailToast] = useState<{ message: string; email: DispatchedEmail } | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const generateEmailData = (apt: Appointment): DispatchedEmail => {
    const matchedPatient = patients.find(
      (p) => p.name.toLowerCase() === apt.patientName.toLowerCase()
    );
    const recipientEmail = matchedPatient?.email || `${apt.patientName.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    const clinicSlug = (apt.clinicName || "clinic").toLowerCase().replace(/[^a-z0-9]/g, "");
    const clinicEmail = `reception@${clinicSlug || "mirahealth"}.com.au`;

    return {
      to: recipientEmail,
      cc: clinicEmail,
      subject: `Appointment Confirmed: ${apt.patientName} at ${apt.clinicName || "Clinic"} (${apt.preferredDate} at ${apt.preferredTime})`,
      body: `Dear ${apt.patientName},

Your healthcare appointment has been CONFIRMED by the clinical administration team at ${apt.clinicName || "our clinic"}.

--- APPOINTMENT SUMMARY ---
• Booking Reference: APT-${apt.id.slice(-6).toUpperCase()}
• Patient Name: ${apt.patientName}
• Clinic Location: ${apt.clinicName}
• Scheduled Date: ${apt.preferredDate}
• Scheduled Time: ${apt.preferredTime}
• Consultation Type: ${apt.appointmentType}
• Clinical Notes: ${apt.notes || "Standard General Consultation"}

--- IMPORTANT PATIENT INSTRUCTIONS ---
1. Please arrive 10 minutes prior to your allocated consultation time.
2. Please bring your Medicare card, concession card, or private health insurance details.
3. Bring any recent blood test results, specialist referral letters, or medication lists.
4. If you need to reschedule or cancel, please provide at least 24 hours notice to avoid cancellation fees.

Warm regards,
Clinical Administration & Patient Care Team
${apt.clinicName || "MIRA Ops Healthcare Partner Practice"}
Powered by MIRA Ops Intelligence
Automated Dispatch System (ISO 27001 / HIPAA Compliant)`,
      sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      appointmentId: apt.id,
      patientName: apt.patientName,
      clinicName: apt.clinicName || "Clinic",
    };
  };

  const handleConfirmAppointment = async (apt: Appointment) => {
    updateAppointmentStatus(apt.id, "confirmed");
    const email = generateEmailData(apt);
    setActiveEmail(email);
    setEmailToast({
      message: `Robotic Workflow triggered: Automated confirmation email dispatched to ${email.to} and clinic reception (${email.cc})!`,
      email,
    });

    // Automatically trigger Robotic Workflow wf_004 (Appointment Confirmation & Email Notice)
    try {
      await runWorkflow("wf_004");
    } catch {
      // safe fallback
    }
  };

  const openEmailInspector = (apt: Appointment) => {
    const email = generateEmailData(apt);
    setActiveEmail(email);
    setShowEmailModal(true);
  };

  const availableClinics = Array.from(
    new Set([
      ...CLINIC_LOCATIONS,
      ...providers.map((p) => p.clinicName).filter(Boolean),
    ])
  );

  const filterClinicOptions = Array.from(
    new Set([
      ...CLINIC_LOCATIONS,
      ...appointments.map((a) => a.clinicName).filter(Boolean),
      ...providers.map((p) => p.clinicName).filter(Boolean),
    ])
  );

  const [formData, setFormData] = useState({
    patientName: "",
    clinicName: CLINIC_LOCATIONS[0],
    preferredDate: "2026-11-12",
    preferredTime: "10:00",
    appointmentType: "General Consultation",
    notes: "",
  });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.notes && apt.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesClinic = clinicFilter === "all" || apt.clinicName === clinicFilter;
    return matchesSearch && matchesStatus && matchesClinic;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);

    const finalClinic = (isCustomClinic && customClinic.trim()) ? customClinic.trim() : (formData.clinicName || CLINIC_LOCATIONS[0]);

    // Conflict check: Check if same clinic and date and time already has a confirmed appointment
    const conflict = appointments.find(
      (a) =>
        a.clinicName?.toLowerCase() === finalClinic.toLowerCase() &&
        a.preferredDate === formData.preferredDate &&
        a.preferredTime === formData.preferredTime &&
        a.status === "confirmed"
    );

    if (conflict) {
      setConflictWarning(
        `Conflict Detected: Clinic ${finalClinic} already has a confirmed appointment at ${formData.preferredTime} on ${formData.preferredDate}. Please select another slot or verify availability.`
      );
      return;
    }

    addAppointment({
      patientId: `pat_${Date.now()}`,
      patientName: formData.patientName,
      clinicName: finalClinic,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      appointmentType: formData.appointmentType,
      notes: formData.notes,
      status: "requested",
    });

    setIsNewModalOpen(false);
    setIsCustomClinic(false);
    setCustomClinic("");
    setFormData({
      patientName: "",
      clinicName: CLINIC_LOCATIONS[0],
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      preferredTime: "10:00",
      appointmentType: "General Consultation",
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#25283A]">Smart Appointment Operations</h2>
          <p className="text-xs text-[#74778A]">
            Intelligent scheduling, clinic conflict checking, and status workflow tracking.
          </p>
        </div>
        <button
          onClick={() => {
            setConflictWarning(null);
            setIsNewModalOpen(true);
          }}
          className="mira-btn-primary text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment Request</span>
        </button>
      </div>

      {/* Dispatched Email Notification Toast */}
      {emailToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <MailCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#25283A]">Email Notification Dispatched:</span>{" "}
              <span className="text-emerald-800">{emailToast.message}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveEmail(emailToast.email);
                setShowEmailModal(true);
              }}
              className="px-3 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs shadow-2xs transition cursor-pointer"
            >
              View Dispatched Email ✉️
            </button>
            <button
              onClick={() => setEmailToast(null)}
              className="text-emerald-600 hover:text-emerald-900 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9699AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search appointments by patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mira-input mira-input-search text-xs"
              style={{ paddingLeft: "42px" }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#74778A]" />
            <span className="text-[#74778A]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#DFDEEB] rounded-lg px-2.5 py-1.5 bg-[#F8F8FC] text-xs focus:outline-none focus:border-[#8DB9F0]"
            >
              <option value="all">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="confirmed">Confirmed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#74778A]" />
            <span className="text-[#74778A]">Clinic:</span>
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="border border-[#DFDEEB] rounded-lg px-2.5 py-1.5 bg-[#F8F8FC] text-xs focus:outline-none focus:border-[#8DB9F0]"
            >
              <option value="all">All Clinics</option>
              {filterClinicOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="mira-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Clinic</th>
                <th>Date & Time</th>
                <th>Service Type</th>
                <th>Status</th>
                <th className="text-right">Manage Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#74778A]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#8DB9F0]/15 flex items-center justify-center text-[#8DB9F0]">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-sm text-[#25283A]">No Scheduled Appointments</div>
                      <p className="text-xs text-[#74778A] max-w-sm">
                        {appointments.length === 0
                          ? "The calendar is open. Click '+ Book Appointment' to schedule a consultation with conflict checking."
                          : "No appointments match your active search and filter criteria."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <div className="font-semibold text-xs text-[#25283A]">{apt.patientName}</div>
                      {apt.notes && (
                        <div className="text-[11px] text-[#74778A] truncate max-w-xs">{apt.notes}</div>
                      )}
                    </td>
                    <td className="text-xs text-[#25283A] font-medium">{apt.clinicName || "—"}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-[#25283A]">
                        <Calendar className="w-3.5 h-3.5 text-[#8DB9F0]" />
                        <span>{apt.preferredDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#74778A]">
                        <Clock className="w-3 h-3 text-[#9699AA]" />
                        <span>{apt.preferredTime || "10:00 AM"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#E9E8F8] text-[#25283A]">
                        {apt.appointmentType || "General Consultation"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className={`mira-badge ${
                            apt.status === "confirmed"
                              ? "mira-badge-green"
                              : apt.status === "requested"
                                ? "mira-badge-blue"
                                : apt.status === "pending_approval"
                                  ? "mira-badge-peach"
                                  : apt.status === "cancelled"
                                    ? "mira-badge-red"
                                    : "mira-badge-gray"
                          }`}
                        >
                          {apt.status.replace("_", " ")}
                        </span>
                        {apt.status === "confirmed" && (
                          <button
                            type="button"
                            onClick={() => openEmailInspector(apt)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#248A63] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded cursor-pointer transition font-medium"
                            title="Click to view automated email sent to patient"
                          >
                            <MailCheck className="w-3 h-3 text-[#248A63]" />
                            <span>Email Sent</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status !== "confirmed" && (
                          <button
                            onClick={() => handleConfirmAppointment(apt)}
                            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                            title="Confirm Booking & Dispatch Email Notification"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}
                        {apt.status !== "cancelled" && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, "cancelled")}
                            className="px-2.5 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                            title="Cancel Booking"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Appointment Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md my-auto bg-white rounded-2xl p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#25283A]">New Appointment Booking</h3>
                <p className="text-xs text-[#74778A]">Creates request with automated clinic conflict checking</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictWarning && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>{conflictWarning}</p>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="mira-label">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emma Watson"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="mira-input"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="mira-label !mb-0">Clinic Location</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomClinic(!isCustomClinic);
                      if (!isCustomClinic) setCustomClinic("");
                    }}
                    className="text-[11px] text-[#8DB9F0] hover:underline font-semibold cursor-pointer"
                  >
                    {isCustomClinic ? "← Pick from list" : "+ Custom Clinic"}
                  </button>
                </div>
                {!isCustomClinic ? (
                  <select
                    value={formData.clinicName}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomClinic(true);
                        setCustomClinic("");
                      } else {
                        setFormData({ ...formData, clinicName: e.target.value });
                      }
                    }}
                    className="mira-input"
                  >
                    {availableClinics.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__custom__">+ Enter Custom Clinic...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Apollo Health, Kauvery Hospital..."
                    value={customClinic}
                    onChange={(e) => {
                      setCustomClinic(e.target.value);
                      setFormData({ ...formData, clinicName: e.target.value });
                    }}
                    className="mira-input"
                    autoFocus
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mira-label">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="mira-input"
                  />
                </div>
                <div>
                  <label className="mira-label">Time</label>
                  <input
                    type="time"
                    required
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="mira-input"
                  />
                </div>
              </div>

              <div>
                <label className="mira-label">Service Type</label>
                <input
                  type="text"
                  value={formData.appointmentType}
                  onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                  className="mira-input"
                />
              </div>

              <div>
                <label className="mira-label">Booking Notes</label>
                <textarea
                  rows={2}
                  placeholder="Clinical notes or patient preference..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mira-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFDEEB]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#F8F8FC] transition"
                >
                  Cancel
                </button>
                <button type="submit" className="mira-btn-primary">
                  Verify & Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Automated Email Notification Inspector Modal */}
      {showEmailModal && activeEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl my-auto bg-white rounded-2xl p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <MailCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#25283A]">Automated Email Notification</h3>
                  <p className="text-xs text-[#74778A]">Dispatched via MIRA Healthcare Communication Engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(false);
                  setResendSuccess(false);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Meta Card */}
            <div className="p-3.5 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#DFDEEB]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    SMTP 250 OK • Dispatched
                  </span>
                  <span className="text-[#74778A]">TLS 1.3 Encrypted</span>
                </div>
                <span className="text-[#74778A] font-mono">{activeEmail.sentAt}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-0.5 text-[11px]">
                <span className="text-[#74778A] font-medium">From:</span>
                <span className="col-span-3 text-[#25283A] font-mono font-medium">MIRA Operations Engine &lt;notifications@miraops.health&gt;</span>
                <span className="text-[#74778A] font-medium">To (Patient):</span>
                <span className="col-span-3 text-[#25283A] font-semibold font-mono">{activeEmail.to}</span>
                <span className="text-[#74778A] font-medium">Cc (Clinic):</span>
                <span className="col-span-3 text-[#25283A] font-mono">{activeEmail.cc}</span>
                <span className="text-[#74778A] font-medium">Subject:</span>
                <span className="col-span-3 text-[#25283A] font-medium">{activeEmail.subject}</span>
              </div>
            </div>

            {/* Email Message Content */}
            <div>
              <label className="mira-label text-xs">Email Message Content (Sent to Patient)</label>
              <pre className="p-4 rounded-xl bg-white border border-[#DFDEEB] text-[11px] text-[#25283A] whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                {activeEmail.body}
              </pre>
            </div>

            {resendSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Email notification successfully re-sent via secondary SMTP relay!</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#DFDEEB]">
              <span className="text-[11px] text-[#74778A]">
                Patient and clinic notified in real time.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResendSuccess(true);
                    setTimeout(() => setResendSuccess(false), 3000);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#DFDEEB] hover:bg-[#F8F8FC] text-xs font-medium text-[#25283A] transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#8DB9F0]" />
                  <span>Resend Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setResendSuccess(false);
                  }}
                  className="mira-btn-primary text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
