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
} from "lucide-react";

export default function AppointmentsPage() {
  const { appointments, addAppointment, updateAppointmentStatus, patients } = useMiraStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

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

    // Conflict check: Check if same clinic and date and time already has a confirmed appointment
    const conflict = appointments.find(
      (a) =>
        a.clinicName === formData.clinicName &&
        a.preferredDate === formData.preferredDate &&
        a.preferredTime === formData.preferredTime &&
        a.status === "confirmed"
    );

    if (conflict) {
      setConflictWarning(
        `Conflict Detected: Clinic ${formData.clinicName} already has a confirmed appointment at ${formData.preferredTime} on ${formData.preferredDate}. Please select another slot or verify availability.`
      );
      return;
    }

    addAppointment({
      patientId: `pat_${Date.now()}`,
      patientName: formData.patientName,
      clinicName: formData.clinicName,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      appointmentType: formData.appointmentType,
      notes: formData.notes,
      status: "requested",
    });

    setIsNewModalOpen(false);
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

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9699AA] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search appointments by patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mira-input pl-9 text-xs"
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
              {CLINIC_LOCATIONS.map((c) => (
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
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status !== "confirmed" && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, "confirmed")}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition"
                            title="Confirm Booking"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status !== "cancelled" && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, "cancelled")}
                            className="px-2 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition"
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
                <label className="mira-label">Clinic Location</label>
                <select
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  className="mira-input"
                >
                  {CLINIC_LOCATIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
    </div>
  );
}
