import { NextResponse } from "next/server";
import { SEED_PATIENTS } from "@/lib/demoData";

export async function GET() {
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
    const newPatient = {
      id: `pat_${Date.now()}`,
      referenceId: `MIRA-2026-${String(SEED_PATIENTS.length + 1).padStart(3, "0")}`,
      name: body.name || "Unknown Patient",
      email: body.email || null,
      phone: body.phone || null,
      dateOfBirth: body.dateOfBirth || null,
      preferredClinic: body.preferredClinic || "Sydney Central Clinic",
      enquiryCategory: body.enquiryCategory || "General Consultation",
      notes: body.notes || "",
      status: missing.length > 0 ? "pending_review" : "active",
      validationScore: score,
      missingFields: missing,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemoData: false,
    };

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

