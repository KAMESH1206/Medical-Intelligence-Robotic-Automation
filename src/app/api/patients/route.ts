import { NextResponse } from "next/server";
import { SEED_PATIENTS } from "@/lib/demoData";
import type { Patient } from "@/lib/types";
import {
  supabase,
  getSupabasePatients,
  insertSupabasePatient,
  updateSupabasePatient,
  deleteSupabasePatient,
} from "@/lib/supabase";

export async function GET() {
  const cloudPatients = await getSupabasePatients();
  if (cloudPatients !== null) {
    return NextResponse.json({
      success: true,
      count: cloudPatients.length,
      data: cloudPatients,
    });
  }
  return NextResponse.json({
    success: true,
    count: SEED_PATIENTS.length,
    data: SEED_PATIENTS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const missing: string[] = [];
    if (!body.email) missing.push("email");
    if (!body.phone) missing.push("phone");
    if (!body.dateOfBirth) missing.push("dateOfBirth");

    const score = Math.max(50, 100 - missing.length * 15);
    const newPatient: Patient = {
      id: body.id || `pat_${Date.now()}`,
      referenceId: body.referenceId || `MIRA-2026-${String(Date.now()).slice(-4)}`,
      name: body.name || "Unknown Patient",
      email: body.email || null,
      phone: body.phone || null,
      dateOfBirth: body.dateOfBirth || null,
      preferredClinic: body.preferredClinic || "Sydney Central Clinic",
      enquiryCategory: body.enquiryCategory || "General Consultation",
      notes: body.notes || "",
      status: body.status || (missing.length > 0 ? "pending_review" : "active"),
      validationScore: score,
      missingFields: missing.length > 0 ? missing : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemoData: false,
    };

    await insertSupabasePatient(newPatient);

    return NextResponse.json({
      success: true,
      message: "Patient intake processed and validated.",
      data: newPatient,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid patient payload" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing patient ID" }, { status: 400 });
    }
    await updateSupabasePatient(id, updates);
    return NextResponse.json({ success: true, message: "Patient updated." });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update patient" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing patient ID" }, { status: 400 });
    }
    if (id === "all") {
      if (supabase) {
        await supabase.from("patients").delete().neq("id", "");
      }
      return NextResponse.json({ success: true, message: "All patients deleted." });
    }
    await deleteSupabasePatient(id);
    return NextResponse.json({ success: true, message: "Patient deleted permanently." });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete patient" }, { status: 500 });
  }
}
