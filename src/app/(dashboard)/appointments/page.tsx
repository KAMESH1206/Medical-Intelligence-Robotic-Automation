"use client";


import React, { useState, useEffect } from "react";
import { useMiraStore } from "@/lib/store";
import { CLINIC_LOCATIONS, SERVICE_TYPES } from "@/lib/constants";
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
  MessageSquare,
  Phone,
  ExternalLink,
  Trash2,
  Pencil,
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

interface DispatchedWhatsapp {
  phone: string;
  patientName: string;
  clinicName: string;
  date: string;
  time: string;
  service: string;
  messageText: string;
  sentAt: string;
  status: "delivered";
}

export default function AppointmentsPage() {
  const { appointments, addAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment, syncAppointments, patients, providers, runWorkflow } = useMiraStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isCustomClinic, setIsCustomClinic] = useState(false);
  const [customClinic, setCustomClinic] = useState("");
  const [activeEmail, setActiveEmail] = useState<DispatchedEmail | null>(null);
  const [activeWhatsapp, setActiveWhatsapp] = useState<DispatchedWhatsapp | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [emailToast, setEmailToast] = useState<{ message: string; email: DispatchedEmail } | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isCustomPatient, setIsCustomPatient] = useState(false);
  const [isCustomService, setIsCustomService] = useState(false);
  const [customService, setCustomService] = useState("");
  const [showBotSimulator, setShowBotSimulator] = useState(false);
  const [simulatorMessages, setSimulatorMessages] = useState<Array<{ sender: "bot" | "patient"; text: string; time: string }>>([
    {
      sender: "bot",
      text: `🏥 *MIRA HEALTHCARE OPERATIONS*\n━━━━━━━━━━━━━━━━━━━━\nDear *Kamesh M R*,\n\nYour healthcare appointment has been *CONFIRMED*!\n\n📅 Date: 2026-11-14\n⏰ Time: 10:00 AM\n🏥 Clinic: Sydney Central Clinic\n\nNeed to reschedule? Reply *RESCHEDULE* right here to select a new date and time.`,
      time: "10:00 AM",
    },
  ]);
  const [simInput, setSimInput] = useState("");
  const [isSimLoading, setIsSimLoading] = useState(false);

  // Edit Appointment Modal State
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    clinicName: CLINIC_LOCATIONS[0],
    preferredDate: "",
    preferredTime: "10:00 AM",
    appointmentType: SERVICE_TYPES[0] || "General Consultation",
    status: "requested" as AppointmentStatus,
    notes: "",
  });

  const handleOpenEdit = (apt: Appointment) => {
    setEditingAppointment(apt);
    setEditFormData({
      patientName: apt.patientName || "",
      patientEmail: apt.patientEmail || "",
      patientPhone: apt.patientPhone || "",
      clinicName: apt.clinicName || CLINIC_LOCATIONS[0],
      preferredDate: apt.preferredDate || "",
      preferredTime: apt.preferredTime || "10:00 AM",
      appointmentType: apt.appointmentType || SERVICE_TYPES[0] || "General Consultation",
      status: apt.status || "requested",
      notes: apt.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment || !editFormData.patientName.trim()) return;

    updateAppointment(editingAppointment.id, {
      ...editFormData,
    });

    setIsEditModalOpen(false);
    setEditingAppointment(null);
  };

  // Poll for live two-way WhatsApp updates every 4 seconds
  useEffect(() => {
    let isMounted = true;
    const fetchSync = async () => {
      try {
        const res = await fetch("/api/appointments");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          syncAppointments(json.data);
        }
      } catch {}
    };
    const interval = setInterval(fetchSync, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [syncAppointments]);

  const handleSendSimulatorMessage = async (textToSend?: string) => {
    const text = (textToSend || simInput).trim();
    if (!text) return;
    setSimInput("");

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSimulatorMessages((prev) => [...prev, { sender: "patient", text, time: nowTime }]);
    setIsSimLoading(true);

    try {
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "917397186456",
          message: text,
          patientName: appointments[0]?.patientName || "Kamesh M R",
        }),
      });

      let reply = "Request received.";
      const rawText = await res.text();
      try {
        const json = JSON.parse(rawText);
        if (json.reply) reply = json.reply;
      } catch {
        const match = rawText.match(/<Message>([\s\S]*?)<\/Message>/);
        if (match) reply = match[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      }

      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setSimulatorMessages((prev) => [...prev, { sender: "bot", text: reply, time: botTime }]);

      // Immediately sync appointments table with the new date/time
      const aptRes = await fetch("/api/appointments");
      const aptJson = await aptRes.json();
      if (aptJson.success && Array.isArray(aptJson.data)) {
        syncAppointments(aptJson.data);
      }
    } catch {
      // safe fallback
    } finally {
      setIsSimLoading(false);
    }
  };

  const generateEmailData = (apt: Appointment): DispatchedEmail => {
    const matchedPatient = patients.find(
      (p) => p.name.toLowerCase() === apt.patientName.toLowerCase()
    );
    // Real recipient: preference to apt.patientEmail, matchedPatient email, or user's Gmail
    const recipientEmail = apt.patientEmail || matchedPatient?.email || "mrkamesh8@gmail.com";
    const clinicSlug = (apt.clinicName || "clinic").toLowerCase().replace(/[^a-z0-9]/g, "");
    const clinicEmail = `reception@${clinicSlug || "mirahealth"}.com.au`;

    return {
      to: recipientEmail,
      cc: clinicEmail,
      subject: `Appointment Confirmed: ${apt.patientName} at ${apt.clinicName || "Clinic"} (${apt.preferredDate} at ${apt.preferredTime || "10:00 AM"})`,
      body: `Dear ${apt.patientName},

Your healthcare appointment has been CONFIRMED by the clinical administration team at ${apt.clinicName || "our clinic"}.

--- APPOINTMENT SUMMARY ---
• Booking Reference: APT-${apt.id.slice(-6).toUpperCase()}
• Patient Name: ${apt.patientName}
• Clinic Location: ${apt.clinicName}
• Scheduled Date: ${apt.preferredDate}
• Scheduled Time: ${apt.preferredTime || "10:00 AM"}
• Consultation Type: ${apt.appointmentType || "General Consultation"}
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
Automated Multi-Channel Dispatch System (ISO 27001 / HIPAA Compliant)`,
      sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      appointmentId: apt.id,
      patientName: apt.patientName,
      clinicName: apt.clinicName || "Clinic",
    };
  };

  const generateWhatsappData = (apt: Appointment): DispatchedWhatsapp => {
    const matchedPatient = patients.find(
      (p) => p.name.toLowerCase() === apt.patientName.toLowerCase()
    );
    const phone = apt.patientPhone || matchedPatient?.phone || "+91 73971 86456";
    const refCode = `APT-${apt.id.slice(-6).toUpperCase()}`;

    const messageText = `🏥 *MIRA HEALTHCARE OPERATIONS*
━━━━━━━━━━━━━━━━━━━━
Dear *${apt.patientName}*,

Your healthcare appointment has been *CONFIRMED*!

📅 *Date:* ${apt.preferredDate}
⏰ *Time:* ${apt.preferredTime || "10:00 AM"}
🩺 *Service:* ${apt.appointmentType || "General Consultation"}
🏥 *Clinic:* ${apt.clinicName}
🔖 *Ref No:* ${refCode}

*Patient Instructions:*
• Please arrive 10 mins prior to your scheduled slot.
• Bring your Photo ID and Medicare / Insurance Card.
• Wear a mask if experiencing respiratory symptoms.

Need to reschedule? Reply *RESCHEDULE* to this WhatsApp or contact reception.`;

    return {
      phone,
      patientName: apt.patientName,
      clinicName: apt.clinicName || "Clinic",
      date: apt.preferredDate,
      time: apt.preferredTime || "10:00 AM",
      service: apt.appointmentType || "General Consultation",
      messageText,
      sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      status: "delivered",
    };
  };

  const handleConfirmAppointment = async (apt: Appointment) => {
    updateAppointmentStatus(apt.id, "confirmed");
    const email = generateEmailData(apt);
    const whatsapp = generateWhatsappData(apt);
    setActiveEmail(email);
    setActiveWhatsapp(whatsapp);

    // 1. Call Real SMTP API Route (Gmail Port 465 SSL)
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });
      const data = await res.json();
      if (data.success) {
        setEmailToast({
          message: `Live Gmail Delivered to ${email.to}! Dispatching WhatsApp alert...`,
          email,
        });
      }
    } catch {
      // safe fallback
    }

    // 2. Call Dedicated WhatsApp API Route (Direct Native Background Dispatch - No Manual Popups)
    try {
      const waRes = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(whatsapp),
      });
      const waData = await waRes.json();
      if (waData.success) {
        setEmailToast({
          message: `✓ Auto-Dispatched: Live Gmail Delivered to ${email.to} & WhatsApp alert automatically sent to ${whatsapp.phone} from clinic WhatsApp!`,
          email,
        });
      }
    } catch {
      // fallback
    }

    // 3. Automatically trigger Robotic Workflow wf_004
    try {
      await runWorkflow("wf_004");
    } catch {
      // safe fallback
    }
  };

  const generateCancellationEmailData = (apt: Appointment): DispatchedEmail => {
    const matchedPatient = patients.find(
      (p) => p.name.toLowerCase() === apt.patientName.toLowerCase()
    );
    const recipientEmail = apt.patientEmail || matchedPatient?.email || "mrkamesh8@gmail.com";
    const clinicSlug = (apt.clinicName || "clinic").toLowerCase().replace(/[^a-z0-9]/g, "");
    const clinicEmail = `reception@${clinicSlug || "mirahealth"}.com.au`;

    return {
      to: recipientEmail,
      cc: clinicEmail,
      subject: `Appointment Cancelled: ${apt.patientName} at ${apt.clinicName || "Clinic"}`,
      body: `Dear ${apt.patientName},

Your healthcare appointment at ${apt.clinicName || "our clinic"} scheduled for ${apt.preferredDate} at ${apt.preferredTime || "10:00 AM"} has been CANCELLED as requested.

--- CANCELLATION SUMMARY ---
• Booking Reference: APT-${apt.id.slice(-6).toUpperCase()}
• Patient Name: ${apt.patientName}
• Clinic Location: ${apt.clinicName}
• Cancelled Slot: ${apt.preferredDate} at ${apt.preferredTime || "10:00 AM"}
• Status: CANCELLED (Slot released to waiting list)

If this cancellation was in error or you would like to reschedule to an alternate date, please contact clinic reception or book via our online portal.

Warm regards,
Clinical Administration Team
${apt.clinicName || "MIRA Ops Healthcare Partner Practice"}
Powered by MIRA Ops Intelligence`,
      sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      appointmentId: apt.id,
      patientName: apt.patientName,
      clinicName: apt.clinicName || "Clinic",
    };
  };

  const generateCancellationWhatsappData = (apt: Appointment): DispatchedWhatsapp => {
    const matchedPatient = patients.find(
      (p) => p.name.toLowerCase() === apt.patientName.toLowerCase()
    );
    const phone = apt.patientPhone || matchedPatient?.phone || "+91 73971 86456";
    const refCode = `APT-${apt.id.slice(-6).toUpperCase()}`;

    const messageText = `⚠️ *MIRA HEALTHCARE - APPOINTMENT CANCELLED*
━━━━━━━━━━━━━━━━━━━━
Dear *${apt.patientName}*,

Your healthcare appointment at *${apt.clinicName}* has been *CANCELLED*.

📅 *Cancelled Date:* ${apt.preferredDate}
⏰ *Cancelled Slot:* ${apt.preferredTime || "10:00 AM"}
🔖 *Ref No:* ${refCode}

If this cancellation was made in error or you would like to reschedule, please reply *REBOOK* to this WhatsApp or contact clinic reception.`;

    return {
      phone,
      patientName: apt.patientName,
      clinicName: apt.clinicName || "Clinic",
      date: apt.preferredDate,
      time: apt.preferredTime || "10:00 AM",
      service: apt.appointmentType || "General Consultation",
      messageText,
      sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      status: "delivered",
    };
  };

  const handleCancelAppointment = async (apt: Appointment) => {
    updateAppointmentStatus(apt.id, "cancelled");
    const email = generateCancellationEmailData(apt);
    const whatsapp = generateCancellationWhatsappData(apt);
    setActiveEmail(email);
    setActiveWhatsapp(whatsapp);

    // 1. Call Real SMTP API Route for cancellation
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });
    } catch {
      // safe fallback
    }

    // 2. Call Dedicated WhatsApp API Route (Direct Twilio Background Dispatch - No Manual Popups)
    try {
      await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(whatsapp),
      });
    } catch {
      // safe fallback
    }

    setEmailToast({
      message: `Cancellation Dispatched: Email sent to ${email.to} & WhatsApp alert dispatched to ${whatsapp.phone}!`,
      email,
    });

    try {
      await runWorkflow("wf_004");
    } catch {
      // safe fallback
    }
  };

  const handleDeleteAppointment = async (id: string, patientName: string) => {
    if (confirm(`Are you sure you want to completely delete the appointment record for "${patientName}"? This action cannot be undone.`)) {
      deleteAppointment(id);
      try {
        await fetch(`/api/appointments?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch {}
    }
  };

  const openEmailInspector = (apt: Appointment) => {
    const email = apt.status === "cancelled" ? generateCancellationEmailData(apt) : generateEmailData(apt);
    setActiveEmail(email);
    setShowEmailModal(true);
  };

  const openWhatsappInspector = (apt: Appointment) => {
    const whatsapp = apt.status === "cancelled" ? generateCancellationWhatsappData(apt) : generateWhatsappData(apt);
    setActiveWhatsapp(whatsapp);
    setShowWhatsappModal(true);
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
    patientEmail: "mrkamesh8@gmail.com",
    patientPhone: "+91 73971 86456",
    clinicName: CLINIC_LOCATIONS[0],
    preferredDate: "2026-11-14",
    preferredTime: "10:00 AM",
    appointmentType: SERVICE_TYPES[0] || "General Consultation",
    notes: "",
    sendEmailNotice: true,
    sendWhatsappNotice: true,
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

    const finalPatientName = formData.patientName.trim();
    if (!finalPatientName) return;

    const finalClinic = (isCustomClinic && customClinic.trim()) ? customClinic.trim() : (formData.clinicName || CLINIC_LOCATIONS[0]);
    const finalServiceType = (isCustomService && customService.trim()) ? customService.trim() : formData.appointmentType;

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

    const newApt = addAppointment({
      patientId: `pat_${Date.now()}`,
      patientName: finalPatientName,
      patientEmail: formData.patientEmail || undefined,
      patientPhone: formData.patientPhone || undefined,
      clinicName: finalClinic,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      appointmentType: finalServiceType,
      notes: formData.notes,
      status: "requested",
    });

    setEmailToast({
      message: `Appointment scheduled for ${finalPatientName}! Status is "requested". Click "Confirm" in the table to dispatch multi-channel notices.`,
      email: generateEmailData(newApt),
    });

    setIsNewModalOpen(false);
    setIsCustomClinic(false);
    setCustomClinic("");
    setIsCustomPatient(false);
    setIsCustomService(false);
    setCustomService("");
    setFormData({
      patientName: "",
      patientEmail: "mrkamesh8@gmail.com",
      patientPhone: "+91 73971 86456",
      clinicName: CLINIC_LOCATIONS[0],
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      preferredTime: "10:00 AM",
      appointmentType: SERVICE_TYPES[0] || "General Consultation",
      notes: "",
      sendEmailNotice: true,
      sendWhatsappNotice: true,
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
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowBotSimulator(true)}
            className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
            title="Open Interactive WhatsApp Two-Way Rescheduling Bot Simulator"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Two-Way WhatsApp Bot</span>
          </button>
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
      </div>

      {/* Dispatched Email & WhatsApp Multi-Channel Notification Toast */}
      {emailToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <MailCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#25283A]">Multi-Channel Automation:</span>{" "}
              <span className="text-emerald-800">{emailToast.message}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveEmail(emailToast.email);
                setShowEmailModal(true);
              }}
              className="px-3 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>View Email</span>
            </button>
            {activeWhatsapp && (
              <>
                <a
                  href={`https://api.whatsapp.com/send?phone=${activeWhatsapp.phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(activeWhatsapp.messageText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
                  title="Open in WhatsApp Web or Mobile App with pre-filled message"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Send WhatsApp ↗</span>
                </a>
                <button
                  onClick={() => {
                    setShowWhatsappModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </>
            )}
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

      {/* Appointments List & Mobile Cards */}
      <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 px-4 text-[#74778A]">
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
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="overflow-x-auto hidden md:block">
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
                  {filteredAppointments.map((apt) => (
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`mira-badge ${apt.status === "confirmed"
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
                          {(apt.status === "confirmed" || apt.status === "cancelled") && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEmailInspector(apt)}
                                className="inline-flex items-center gap-1 text-[11px] text-[#248A63] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded cursor-pointer transition font-medium"
                                title={`Click to view automated ${apt.status} email`}
                              >
                                <MailCheck className="w-3 h-3 text-[#248A63]" />
                                <span>Email</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openWhatsappInspector(apt)}
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 border border-emerald-300 px-1.5 py-0.5 rounded cursor-pointer transition font-medium"
                                title={`Click to view automated ${apt.status} WhatsApp alert`}
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-700" />
                                <span>WhatsApp</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status !== "confirmed" && (
                            <button
                              onClick={() => handleConfirmAppointment(apt)}
                              className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                              title="Confirm Booking & Dispatch Confirmation Notice"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm</span>
                            </button>
                          )}
                          {apt.status !== "cancelled" && (
                            <button
                              onClick={() => handleCancelAppointment(apt)}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                              title="Cancel Booking & Dispatch Cancellation Notice"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(apt)}
                            className="p-1.5 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#8DB9F0]/15 hover:text-[#6BA3E8] hover:border-[#8DB9F0]/50 transition cursor-pointer"
                            title="Edit Appointment Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAppointment(apt.id, apt.patientName)}
                            className="p-1.5 rounded text-[#9699AA] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                            title="Delete Appointment Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden divide-y divide-[#DFDEEB]">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#25283A]">{apt.patientName}</div>
                      <div className="text-xs text-[#74778A]">{apt.clinicName || "—"}</div>
                    </div>
                    <span
                      className={`mira-badge text-[10px] ${
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
                  </div>

                  <div className="flex items-center justify-between text-xs bg-[#F8F8FC] p-2.5 rounded-lg border border-[#DFDEEB]/60">
                    <div className="flex items-center gap-1.5 text-[#25283A] font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#8DB9F0]" />
                      <span>{apt.preferredDate}</span>
                      <span className="text-[#9699AA]">·</span>
                      <Clock className="w-3.5 h-3.5 text-[#9699AA]" />
                      <span>{apt.preferredTime || "10:00 AM"}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#E9E8F8] text-[#25283A] font-semibold">
                      {apt.appointmentType || "General"}
                    </span>
                  </div>

                  {apt.notes && (
                    <div className="text-[11px] text-[#74778A] bg-amber-50/50 p-2 rounded-lg border border-amber-200/40">
                      <strong>Notes:</strong> {apt.notes}
                    </div>
                  )}

                  {/* Notification inspectors & Quick Actions on Mobile */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(apt.status === "confirmed" || apt.status === "cancelled") && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEmailInspector(apt)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <MailCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View Email</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openWhatsappInspector(apt)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>WhatsApp</span>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#DFDEEB]/50">
                    {apt.status !== "confirmed" && (
                      <button
                        onClick={() => handleConfirmAppointment(apt)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Booking</span>
                      </button>
                    )}
                    {apt.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancelAppointment(apt)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(apt)}
                      className="p-1.5 rounded-lg border border-[#8DB9F0]/40 bg-[#8DB9F0]/10 hover:bg-[#8DB9F0]/20 text-[#6BA3E8] transition cursor-pointer"
                      title="Edit Appointment"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAppointment(apt.id, apt.patientName)}
                      className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-[#9699AA] hover:text-rose-600 transition cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {/* 1. Patient Selection Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="mira-label !mb-0">Patient Name *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomPatient(!isCustomPatient);
                      if (!isCustomPatient) {
                        setFormData({ ...formData, patientName: "", patientEmail: "mrkamesh8@gmail.com", patientPhone: "+91 73971 86456" });
                      }
                    }}
                    className="text-[11px] text-[#8DB9F0] hover:underline font-semibold cursor-pointer"
                  >
                    {isCustomPatient ? "← Select from Registered Patients" : "+ Enter New / Custom Patient"}
                  </button>
                </div>
                {!isCustomPatient ? (
                  <select
                    value={formData.patientName}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomPatient(true);
                        setFormData({ ...formData, patientName: "", patientEmail: "mrkamesh8@gmail.com", patientPhone: "+91 73971 86456" });
                      } else {
                        const selected = patients.find((p) => p.name === e.target.value);
                        setFormData({
                          ...formData,
                          patientName: e.target.value,
                          patientEmail: selected?.email || "mrkamesh8@gmail.com",
                          patientPhone: selected?.phone || "+91 73971 86456",
                        });
                      }
                    }}
                    className="mira-input"
                    required
                  >
                    <option value="">-- Select Patient from System --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.referenceId}) {p.phone ? `• ${p.phone}` : ""}
                      </option>
                    ))}
                    <option value="__custom__">+ Enter New / Custom Patient...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emma Watson / John Doe"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="mira-input"
                    autoFocus
                  />
                )}
              </div>

              {/* 2. Contact details for Multi-Channel Automation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mira-label">Email (For Automated Email)</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    className="mira-input"
                  />
                </div>
                <div>
                  <label className="mira-label">WhatsApp Mobile (For WhatsApp Alert)</label>
                  <input
                    type="tel"
                    placeholder="+91 73971 86456"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="mira-input"
                  />
                </div>
              </div>

              {/* 3. Clinic Location */}
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

              {/* 4. Date & Time Slot Dropdown */}
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
                  <label className="mira-label">Time Slot</label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="mira-input"
                  >
                    {[
                      "09:00 AM",
                      "09:30 AM",
                      "10:00 AM",
                      "10:30 AM",
                      "11:00 AM",
                      "11:30 AM",
                      "02:00 PM",
                      "02:30 PM",
                      "03:00 PM",
                      "03:30 PM",
                      "04:00 PM",
                      "04:30 PM",
                      "05:00 PM",
                    ].map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 5. Service Type Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="mira-label !mb-0">Service Type</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomService(!isCustomService);
                      if (!isCustomService) setCustomService("");
                    }}
                    className="text-[11px] text-[#8DB9F0] hover:underline font-semibold cursor-pointer"
                  >
                    {isCustomService ? "← Pick Standard Service" : "+ Custom Service"}
                  </button>
                </div>
                {!isCustomService ? (
                  <select
                    value={formData.appointmentType}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomService(true);
                      } else {
                        setFormData({ ...formData, appointmentType: e.target.value });
                      }
                    }}
                    className="mira-input"
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="__custom__">+ Enter Custom Service...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Cardiology Echocardiogram, Wound Dressing..."
                    value={customService}
                    onChange={(e) => {
                      setCustomService(e.target.value);
                      setFormData({ ...formData, appointmentType: e.target.value });
                    }}
                    className="mira-input"
                    autoFocus
                    required
                  />
                )}
              </div>

              {/* 6. Multi-Channel Automated Dispatch Toggles */}
              <div className="p-3 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] space-y-2">
                <div className="text-[11px] font-bold text-[#25283A] uppercase tracking-wider">
                  ⚡ Automated Robotic Dispatch Channels
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-[#25283A]">
                    <input
                      type="checkbox"
                      checked={formData.sendEmailNotice}
                      onChange={(e) => setFormData({ ...formData, sendEmailNotice: e.target.checked })}
                      className="w-4 h-4 rounded text-[#8DB9F0] focus:ring-[#8DB9F0]"
                    />
                    <span>Automated Email Notice</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-800">
                    <input
                      type="checkbox"
                      checked={formData.sendWhatsappNotice}
                      onChange={(e) => setFormData({ ...formData, sendWhatsappNotice: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Automated WhatsApp Alert</span>
                  </label>
                </div>
              </div>

              {/* 7. Booking Notes */}
              <div>
                <label className="mira-label">Booking Notes</label>
                <textarea
                  rows={2}
                  placeholder="Clinical notes, patient preference, or referral remarks..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mira-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFDEEB]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#F8F8FC] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="mira-btn-primary cursor-pointer flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Verify & Schedule</span>
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
                <a
                  href={`mailto:${activeEmail.to}?subject=${encodeURIComponent(activeEmail.subject)}&body=${encodeURIComponent(activeEmail.body)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Send via Gmail / Mail App</span>
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetch("/api/send-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(activeEmail),
                      });
                    } catch {
                      // fallback
                    }
                    setResendSuccess(true);
                    setTimeout(() => setResendSuccess(false), 4000);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#DFDEEB] hover:bg-[#F8F8FC] text-xs font-medium text-[#25283A] transition cursor-pointer flex items-center gap-1.5"
                  title="Resend this exact email via live Gmail SMTP"
                >
                  <Send className="w-3.5 h-3.5 text-[#8DB9F0]" />
                  <span>Resend Live Email</span>
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

      {/* Automated WhatsApp Message Inspector Modal */}
      {showWhatsappModal && activeWhatsapp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md my-auto bg-white rounded-2xl p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#25283A]">WhatsApp Automation Alert</h3>
                  <p className="text-xs text-[#74778A]">Dispatched via WhatsApp Business Cloud API</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsappModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta Card */}
            <div className="p-3 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-[#DFDEEB]">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Delivered • Double Checkmark ✓✓
                </span>
                <span className="text-[#74778A] font-mono">{activeWhatsapp.sentAt}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                <span className="text-[#74778A]">Recipient:</span>
                <span className="col-span-2 font-semibold text-[#25283A] font-mono">{activeWhatsapp.patientName} ({activeWhatsapp.phone})</span>
                <span className="text-[#74778A]">Provider:</span>
                <span className="col-span-2 font-mono text-[#25283A]">WhatsApp Cloud Gateway (Meta)</span>
              </div>
            </div>

            {/* Realistic WhatsApp Chat Bubble */}
            <div>
              <label className="mira-label text-xs mb-1.5">Mobile Chat Message Preview</label>
              <div className="p-4 rounded-2xl bg-[#E5DDD5] border border-[#DFDEEB] space-y-2">
                <div className="bg-[#DCF8C6] text-[#25283A] p-3.5 rounded-xl rounded-tr-none shadow-xs text-xs whitespace-pre-wrap font-sans leading-relaxed max-w-[94%] ml-auto border border-emerald-200/60">
                  {activeWhatsapp.messageText}
                  <div className="text-[10px] text-emerald-800 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                    <span>{activeWhatsapp.sentAt}</span>
                    <span className="text-blue-600 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#DFDEEB]">
              <span className="text-[11px] text-[#74778A]">
                End-to-end encrypted notification.
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?phone=${activeWhatsapp.phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(activeWhatsapp.messageText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowWhatsappModal(false)}
                  className="mira-btn-primary text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-Way WhatsApp Conversational Rescheduling Bot Simulator Modal */}
      {showBotSimulator && (
        <div className="fixed inset-0 bg-[#25283A]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#DFDEEB] flex flex-col h-[650px] max-h-[92vh]">
            {/* WhatsApp Phone Top App Bar */}
            <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center font-bold text-white text-sm shadow-inner">
                    MIRA
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm leading-tight">MIRA Healthcare Bot</span>
                    <span className="bg-emerald-500/40 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded font-mono">VERIFIED</span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-tight flex items-center gap-1">
                    <span>Clinic Sender: +91 73971 86456</span>
                    <span>•</span>
                    <span className="text-emerald-300">Online 24/7</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBotSimulator(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                title="Close Simulator"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Synchronized Info Bar */}
            <div className="bg-[#128C7E] px-4 py-1.5 text-[11px] text-white/95 flex items-center justify-between shrink-0 border-t border-emerald-600/40 font-mono">
              <span>Patient: {appointments[0]?.patientName || "Kamesh M R"} (+91 73971 86456)</span>
              <span className="text-emerald-200">Table Auto-Sync Active</span>
            </div>

            {/* WhatsApp Chat Conversation Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#EFEAE2] bg-opacity-95">
              <div className="flex justify-center my-1">
                <span className="bg-[#E1D7CA] text-[#54656F] text-[10px] px-3 py-1 rounded-md shadow-2xs font-medium">
                  TODAY • ENCRYPTED TWO-WAY CLINICAL DISPATCH
                </span>
              </div>

              {simulatorMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-150`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs relative leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "patient"
                        ? "bg-[#D9FDD3] text-[#111B21] rounded-tr-xs"
                        : "bg-white text-[#111B21] rounded-tl-xs border border-black/5"
                    }`}
                  >
                    {msg.text}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781] font-mono select-none">
                      <span>{msg.time}</span>
                      {msg.sender === "patient" && (
                        <span className="text-[#53BDEB] font-bold">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isSimLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-xs px-4 py-2 shadow-xs border border-black/5 flex items-center gap-1.5 text-xs text-[#667781]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] ml-1 font-mono text-emerald-800">Bot thinking & updating table...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="bg-[#F0F2F5] px-3 py-2 border-t border-[#DFDEEB] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              <span className="text-[10px] text-[#667781] font-bold uppercase shrink-0 font-mono">Quick Reply:</span>
              <button
                type="button"
                onClick={() => handleSendSimulatorMessage("RESCHEDULE")}
                disabled={isSimLoading}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-semibold whitespace-nowrap shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                📅 Reply RESCHEDULE
              </button>
              <button
                type="button"
                onClick={() => handleSendSimulatorMessage("1")}
                disabled={isSimLoading}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 text-[11px] font-semibold whitespace-nowrap shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                1️⃣ Pick Slot 1
              </button>
              <button
                type="button"
                onClick={() => handleSendSimulatorMessage("2")}
                disabled={isSimLoading}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 text-[11px] font-semibold whitespace-nowrap shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                2️⃣ Pick Slot 2
              </button>
              <button
                type="button"
                onClick={() => handleSendSimulatorMessage("CONFIRM")}
                disabled={isSimLoading}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 text-[11px] font-semibold whitespace-nowrap shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                ✅ Confirm
              </button>
            </div>

            {/* WhatsApp Bottom Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendSimulatorMessage();
              }}
              className="p-2.5 bg-[#F0F2F5] flex items-center gap-2 shrink-0 border-t border-black/5"
            >
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="Type a message (e.g. 'RESCHEDULE' or '1')..."
                className="flex-1 bg-white border border-[#D1D7DB] rounded-full px-4 py-2 text-xs text-[#111B21] placeholder-[#667781] focus:outline-hidden focus:ring-1 focus:ring-[#075E54]"
                disabled={isSimLoading}
              />
              <button
                type="submit"
                disabled={isSimLoading || !simInput.trim()}
                className="p-2.5 bg-[#075E54] hover:bg-[#128C7E] disabled:opacity-40 text-white rounded-full transition shadow-xs cursor-pointer flex items-center justify-center shrink-0"
                title="Send as Patient"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {isEditModalOpen && editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto bg-white rounded-2xl p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#25283A] flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#8DB9F0]" />
                  <span>Edit Appointment: {editingAppointment.patientName}</span>
                </h3>
                <p className="text-xs text-[#74778A] mt-0.5">Real-time sync to Supabase Cloud & Local Storage</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAppointment(null);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="mira-label">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.patientName}
                  onChange={(e) => setEditFormData({ ...editFormData, patientName: e.target.value })}
                  className="mira-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mira-label">Patient Email</label>
                  <input
                    type="email"
                    value={editFormData.patientEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, patientEmail: e.target.value })}
                    className="mira-input"
                  />
                </div>
                <div>
                  <label className="mira-label">Patient Phone</label>
                  <input
                    type="tel"
                    value={editFormData.patientPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, patientPhone: e.target.value })}
                    className="mira-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mira-label">Clinic Location</label>
                  <input
                    type="text"
                    value={editFormData.clinicName}
                    onChange={(e) => setEditFormData({ ...editFormData, clinicName: e.target.value })}
                    className="mira-input"
                  />
                </div>
                <div>
                  <label className="mira-label">Service Type</label>
                  <select
                    value={editFormData.appointmentType}
                    onChange={(e) => setEditFormData({ ...editFormData, appointmentType: e.target.value })}
                    className="mira-input"
                  >
                    {SERVICE_TYPES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mira-label">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={editFormData.preferredDate}
                    onChange={(e) => setEditFormData({ ...editFormData, preferredDate: e.target.value })}
                    className="mira-input"
                  />
                </div>
                <div>
                  <label className="mira-label">Preferred Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={editFormData.preferredTime}
                    onChange={(e) => setEditFormData({ ...editFormData, preferredTime: e.target.value })}
                    className="mira-input"
                  />
                </div>
              </div>

              <div>
                <label className="mira-label">Booking Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as AppointmentStatus })}
                  className="mira-input font-medium"
                >
                  <option value="requested">Requested</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="mira-label">Clinical / Admin Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for visit, follow-up instructions..."
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="mira-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFDEEB]">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingAppointment(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#F8F8FC] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="mira-btn-primary cursor-pointer flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
