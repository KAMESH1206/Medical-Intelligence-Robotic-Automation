import { NextResponse } from "next/server";
import { SEED_APPOINTMENTS } from "@/lib/demoData";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: SEED_APPOINTMENTS.length,
    data: SEED_APPOINTMENTS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check conflict
    const conflict = SEED_APPOINTMENTS.find(
      (a) =>
        a.clinicName === body.clinicName &&
        a.preferredDate === body.preferredDate &&
        a.preferredTime === body.preferredTime &&
        a.status === "confirmed"
    );

    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          error: `Scheduling Conflict: ${body.clinicName} is already booked at ${body.preferredTime} on ${body.preferredDate}.`,
        },
        { status: 409 }
      );
    }

    const newApt = {
      id: `apt_${Date.now()}`,
      patientId: `pat_${Date.now()}`,
      patientName: body.patientName,
      clinicName: body.clinicName || "Sydney Central Clinic",
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime || "10:00",
      appointmentType: body.appointmentType || "General Consultation",
      status: "requested",
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemoData: false,
    };

    return NextResponse.json({
      success: true,
      message: "Appointment request scheduled.",
      data: newApt,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to schedule appointment" },
      { status: 400 }
    );
  }
}

