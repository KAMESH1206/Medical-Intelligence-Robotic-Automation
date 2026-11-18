import { createClient } from "@supabase/supabase-js";
import type { Patient, Appointment, Document } from "./types";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://hwczsuougmcirzaljpzy.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_PZr3AXlwbKjzvY68ned4cw_czYFVNIT";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ==========================================
// Safe Supabase Data Operations (with Local Fallback)
// ==========================================

export async function getSupabasePatients(): Promise<Patient[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      referenceId: row.reference_id || row.referenceId || `PAT-${row.id.slice(0, 6)}`,
      name: row.name || `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Unknown",
      email: row.email || undefined,
      phone: row.phone || undefined,
      dateOfBirth: row.date_of_birth || row.dob || undefined,
      preferredClinic: row.preferred_clinic || row.clinic_name || "Sydney Central Clinic",
      enquiryCategory: row.enquiry_category || "General Consultation",
      notes: row.notes || undefined,
      status: row.status || "active",
      validationScore: row.validation_score ?? 95,
      missingFields: Array.isArray(row.missing_fields) ? row.missing_fields : [],
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
      isDemoData: false,
    }));
  } catch {
    return null;
  }
}

export async function insertSupabasePatient(patient: Patient): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("patients").insert([
      {
        id: patient.id,
        reference_id: patient.referenceId,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        date_of_birth: patient.dateOfBirth,
        preferred_clinic: patient.preferredClinic,
        enquiry_category: patient.enquiryCategory,
        notes: patient.notes,
        status: patient.status,
        validation_score: patient.validationScore,
        missing_fields: patient.missingFields,
        created_at: patient.createdAt,
        updated_at: patient.updatedAt,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function getSupabaseAppointments(): Promise<Appointment[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      patientId: row.patient_id || row.patientId || "",
      patientName: row.patient_name || row.patientName || "Patient",
      patientEmail: row.patient_email || row.patientEmail,
      patientPhone: row.patient_phone || row.patientPhone,
      clinicId: row.clinic_id || row.clinicId,
      clinicName: row.clinic_name || row.clinicName || "Sydney Central Clinic",
      preferredDate: row.preferred_date || row.appointment_date || new Date().toISOString().split("T")[0],
      preferredTime: row.preferred_time || row.appointment_time || "10:00 AM",
      appointmentType: row.appointment_type || row.type || "General Consultation",
      status: row.status || "requested",
      notes: row.notes || "",
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      isDemoData: false,
    }));
  } catch {
    return null;
  }
}

export async function insertSupabaseAppointment(apt: Appointment): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("appointments").insert([
      {
        id: apt.id,
        patient_id: apt.patientId,
        patient_name: apt.patientName,
        patient_email: apt.patientEmail,
        patient_phone: apt.patientPhone,
        clinic_name: apt.clinicName,
        preferred_date: apt.preferredDate,
        preferred_time: apt.preferredTime,
        appointment_type: apt.appointmentType,
        status: apt.status,
        notes: apt.notes,
        created_at: apt.createdAt,
        updated_at: apt.updatedAt,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function updateSupabasePatient(id: string, updates: Partial<Patient>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.dateOfBirth !== undefined) payload.date_of_birth = updates.dateOfBirth;
    if (updates.preferredClinic !== undefined) payload.preferred_clinic = updates.preferredClinic;
    if (updates.enquiryCategory !== undefined) payload.enquiry_category = updates.enquiryCategory;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.validationScore !== undefined) payload.validation_score = updates.validationScore;
    if (updates.missingFields !== undefined) payload.missing_fields = updates.missingFields;

    const { error } = await supabase.from("patients").update(payload).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteSupabasePatient(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("patients").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function updateSupabaseAppointment(id: string, updates: Partial<Appointment>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.patientName !== undefined) payload.patient_name = updates.patientName;
    if (updates.patientEmail !== undefined) payload.patient_email = updates.patientEmail;
    if (updates.patientPhone !== undefined) payload.patient_phone = updates.patientPhone;
    if (updates.clinicName !== undefined) payload.clinic_name = updates.clinicName;
    if (updates.preferredDate !== undefined) payload.preferred_date = updates.preferredDate;
    if (updates.preferredTime !== undefined) payload.preferred_time = updates.preferredTime;
    if (updates.appointmentType !== undefined) payload.appointment_type = updates.appointmentType;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { error } = await supabase.from("appointments").update(payload).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteSupabaseAppointment(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export interface SupabaseAuthUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "super_admin" | "healthcare_admin" | "data_coordinator" | "operations_executive" | "viewer";
  avatar: string;
  organization?: string;
  created_at?: string;
}

export async function getSupabaseUserByEmail(email: string): Promise<SupabaseAuthUser | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || "healthcare_admin",
      avatar: data.avatar || "MO",
      organization: data.organization,
      created_at: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function insertSupabaseUser(user: SupabaseAuthUser): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("users").upsert([
      {
        id: user.id,
        name: user.name,
        email: user.email.trim().toLowerCase(),
        password: user.password,
        role: user.role,
        avatar: user.avatar,
        organization: user.organization,
        created_at: user.created_at || new Date().toISOString(),
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}
