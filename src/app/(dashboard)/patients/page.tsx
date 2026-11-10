"use client";


import React, { useState } from "react";
import { useMiraStore } from "@/lib/store";
import { CLINIC_LOCATIONS, ENQUIRY_CATEGORIES, ROLE_PERMISSIONS } from "@/lib/constants";
import type { Patient, PatientStatus } from "@/lib/types";
import {
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  Sparkles,
  Download,
  Building,
  Lock,
  X,
} from "lucide-react";

export default function PatientsPage() {
  const { patients, addPatient, deletePatient, updatePatient, currentUser } = useMiraStore();
  const perms = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.healthcare_admin;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Patient Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    preferredClinic: CLINIC_LOCATIONS[0],
    enquiryCategory: ENQUIRY_CATEGORIES[0],
    notes: "",
  });

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesClinic = clinicFilter === "all" || p.preferredClinic === clinicFilter;
    return matchesSearch && matchesStatus && matchesClinic;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Check missing fields & compute synthetic validation score
    const missing: string[] = [];
    if (!formData.email) missing.push("email");
    if (!formData.phone) missing.push("phone");
    if (!formData.dateOfBirth) missing.push("dateOfBirth");

    const score = Math.max(50, 100 - missing.length * 15);
    const status: PatientStatus = missing.length > 1 ? "incomplete" : missing.length === 1 ? "pending_review" : "active";

    addPatient({
      ...formData,
      status,
      validationScore: score,
      missingFields: missing.length > 0 ? missing : undefined,
    });

    setIsAddModalOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      preferredClinic: CLINIC_LOCATIONS[0],
      enquiryCategory: ENQUIRY_CATEGORIES[0],
      notes: "",
    });
  };

  const exportCSV = () => {
    const headers = "Reference ID,Name,Email,Phone,Clinic,Category,Status,Validation Score\n";
    const rows = filteredPatients
      .map(
        (p) =>
          `"${p.referenceId}","${p.name}","${p.email || ""}","${p.phone || ""}","${p.preferredClinic || ""}","${p.enquiryCategory || ""}","${p.status}","${p.validationScore || 0}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mira_patients_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#25283A]">Patient Intake & Enquiries</h2>
          <p className="text-xs text-[#74778A]">
            Automated intake validation, duplicate detection, and missing field alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DFDEEB] bg-white hover:bg-[#F8F8FC] text-xs font-medium text-[#25283A] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#74778A]" />
            <span>Export CSV</span>
          </button>
          {perms.canAddPatient ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mira-btn-primary text-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Patient Intake</span>
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-2 rounded-lg bg-[#F8F8FC] border border-[#DFDEEB] text-xs font-medium text-[#9699AA] cursor-not-allowed flex items-center gap-1.5"
              title={`Patient intake locked for ${perms.label}`}
            >
              <Lock className="w-3.5 h-3.5 text-[#9699AA]" />
              <span>Intake Locked ({perms.label})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#DFDEEB] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9699AA] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by patient name, ID, email..."
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
              <option value="active">Active</option>
              <option value="pending_review">Pending Review</option>
              <option value="incomplete">Incomplete</option>
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

      {/* Patients Table */}
      <div className="rounded-xl bg-white border border-[#DFDEEB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="mira-table">
            <thead>
              <tr>
                <th>Patient / Ref</th>
                <th>Contact</th>
                <th>Clinic & Category</th>
                <th>Quality Score</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#74778A]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#8DB9F0]/15 flex items-center justify-center text-[#8DB9F0]">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-sm text-[#25283A]">No Patient Enquiries in Queue</div>
                      <p className="text-xs text-[#74778A] max-w-sm">
                        {patients.length === 0
                          ? "Your intake queue is clean. Click '+ New Patient Intake' to submit and validate a real patient enquiry."
                          : "No records match your current search and filter criteria."}
                      </p>
                      {patients.length === 0 && perms.canAddPatient && (
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(true)}
                          className="mt-2 mira-btn-primary text-xs cursor-pointer"
                        >
                          + New Patient Intake
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="transition-colors">
                    <td>
                      <div className="font-semibold text-[#25283A]">{patient.name}</div>
                      <div className="text-[11px] text-[#74778A] font-mono">{patient.referenceId}</div>
                    </td>
                    <td>
                      <div className="text-xs text-[#25283A]">{patient.phone || <span className="text-rose-500 font-medium">Missing phone</span>}</div>
                      <div className="text-[11px] text-[#74778A]">{patient.email || <span className="text-rose-500 font-medium">Missing email</span>}</div>
                    </td>
                    <td>
                      <div className="text-xs font-medium text-[#25283A]">{patient.preferredClinic || "—"}</div>
                      <div className="text-[11px] text-[#74778A]">{patient.enquiryCategory || "General"}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-[#E9E8F8] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (patient.validationScore || 0) >= 90
                                ? "bg-[#248A63]"
                                : (patient.validationScore || 0) >= 70
                                ? "bg-[#8DB9F0]"
                                : "bg-[#F5B69E]"
                            }`}
                            style={{ width: `${patient.validationScore || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#25283A]">
                          {patient.validationScore || 0}%
                        </span>
                      </div>
                      {patient.missingFields && patient.missingFields.length > 0 && (
                        <div className="text-[10px] text-[#EE9478] font-medium mt-0.5">
                          Missing: {patient.missingFields.join(", ")}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`mira-badge ${
                          patient.status === "active"
                            ? "mira-badge-green"
                            : patient.status === "pending_review"
                            ? "mira-badge-peach"
                            : "mira-badge-yellow"
                        }`}
                      >
                        {patient.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="p-1.5 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#E9E8F8] hover:text-[#25283A] transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {perms.canDeletePatient && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove record for ${patient.name}?`)) {
                                deletePatient(patient.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            title="Super Admin: Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="p-3 border-t border-[#DFDEEB] bg-[#F8F8FC] flex items-center justify-between text-xs text-[#74778A]">
          <span>Showing {filteredPatients.length} of {patients.length} records</span>
          <span className="text-[11px] text-[#9699AA]">Verified Clinical Operations Data</span>
        </div>
      </div>

      {/* Patient Detail Drawer / Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto bg-white rounded-2xl p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#DFDEEB] pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#8DB9F0] font-bold">
                  {selectedPatient.referenceId}
                </span>
                <h3 className="text-lg font-bold text-[#25283A]">{selectedPatient.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                <div className="text-[#74778A]">Phone Number</div>
                <div className="font-semibold text-[#25283A] mt-0.5">{selectedPatient.phone || "Not provided"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                <div className="text-[#74778A]">Email Address</div>
                <div className="font-semibold text-[#25283A] mt-0.5">{selectedPatient.email || "Not provided"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                <div className="text-[#74778A]">Preferred Clinic</div>
                <div className="font-semibold text-[#25283A] mt-0.5">{selectedPatient.preferredClinic || "None specified"}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F8FC] border border-[#DFDEEB]">
                <div className="text-[#74778A]">Enquiry Category</div>
                <div className="font-semibold text-[#25283A] mt-0.5">{selectedPatient.enquiryCategory || "General"}</div>
              </div>
            </div>

            {selectedPatient.notes && (
              <div className="p-3 rounded-xl bg-[#E9E8F8]/40 border border-[#DFDEEB] text-xs">
                <div className="font-semibold text-[#25283A] mb-1">Administrative Notes:</div>
                <p className="text-[#74778A]">{selectedPatient.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#DFDEEB]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#74778A]">Status:</span>
                <select
                  value={selectedPatient.status}
                  onChange={(e) => {
                    updatePatient(selectedPatient.id, { status: e.target.value as PatientStatus });
                    setSelectedPatient({ ...selectedPatient, status: e.target.value as PatientStatus });
                  }}
                  className="border border-[#DFDEEB] rounded-lg px-2 py-1 bg-[#F8F8FC] text-xs font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-1.5 rounded-lg bg-[#8DB9F0] text-white text-xs font-semibold hover:bg-[#6BA3E8] transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-auto bg-white rounded-2xl p-6 shadow-2xl border border-[#DFDEEB] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DFDEEB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#25283A]">New Patient Enquiry Intake</h3>
                <p className="text-xs text-[#74778A]">Enter patient details for automated validation and categorization</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74778A] hover:text-[#25283A] hover:bg-[#F8F8FC] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="mira-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith / John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mira-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mira-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com.au"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mira-input"
                  />
                </div>
                <div>
                  <label className="mira-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0412 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mira-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mira-label">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="mira-input"
                  />
                </div>
                <div>
                  <label className="mira-label">Preferred Clinic</label>
                  <select
                    value={formData.preferredClinic}
                    onChange={(e) => setFormData({ ...formData, preferredClinic: e.target.value })}
                    className="mira-input"
                  >
                    {CLINIC_LOCATIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mira-label">Enquiry Category</label>
                <select
                  value={formData.enquiryCategory}
                  onChange={(e) => setFormData({ ...formData, enquiryCategory: e.target.value })}
                  className="mira-input"
                >
                  {ENQUIRY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mira-label">Administrative Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any referral notes, health summary, or triage comments..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mira-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFDEEB]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#DFDEEB] text-[#74778A] hover:bg-[#F8F8FC] transition"
                >
                  Cancel
                </button>
                <button type="submit" className="mira-btn-primary">
                  Validate & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

