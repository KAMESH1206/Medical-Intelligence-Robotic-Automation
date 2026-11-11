import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SEED_APPOINTMENTS } from "@/lib/demoData";
import type { Appointment } from "@/lib/types";

const APPOINTMENTS_FILE = path.resolve(process.cwd(), "data/appointments_state.json");

function getLiveAppointments(): Appointment[] {
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      const data = fs.readFileSync(APPOINTMENTS_FILE, "utf-8");
      return JSON.parse(data);
    } else {
      fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(SEED_APPOINTMENTS, null, 2), "utf-8");
      return SEED_APPOINTMENTS;
    }
  } catch (e) {
    console.warn("Could not read appointments file:", e);
  }
  return SEED_APPOINTMENTS;
}

function saveLiveAppointments(apts: Appointment[]) {
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(apts, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save appointments:", e);
  }
}

export async function GET() {
  const data = getLiveAppointments();
  return NextResponse.json({
    success: true,
    count: data.length,
    data,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const appointments = getLiveAppointments();

    // Check conflict
    const conflict = appointments.find(
      (a) =>
        a.clinicName === body.clinicName &&
        a.preferredDate === body.preferredDate &&
        a.preferredTime === body.preferredTime &&
        a.status === "confirmed" &&
        a.id !== body.id
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

    if (body.action === "reset") {
      saveLiveAppointments(SEED_APPOINTMENTS);
      return NextResponse.json({ success: true, message: "Appointments reset to seeds.", data: SEED_APPOINTMENTS });
    }

    if (body.action === "delete" && body.id) {
      if (body.id === "all") {
        saveLiveAppointments([]);
        return NextResponse.json({ success: true, message: "All appointments deleted.", count: 0 });
      }
      const updated = appointments.filter((a) => a.id !== body.id);
      saveLiveAppointments(updated);
      return NextResponse.json({ success: true, message: "Appointment deleted.", count: updated.length });
    }

    if (body.action === "update" && body.id) {
      const updated = appointments.map((a) =>
        a.id === body.id ? { ...a, ...body, updatedAt: new Date().toISOString() } : a
      );
      saveLiveAppointments(updated);
      return NextResponse.json({ success: true, data: updated.find((a) => a.id === body.id) });
    }

    const newApt: Appointment = {
      id: body.id || `apt_${Date.now()}`,
      patientId: body.patientId || `pat_${Date.now()}`,
      patientName: body.patientName,
      patientEmail: body.patientEmail,
      patientPhone: body.patientPhone,
      clinicName: body.clinicName || "Sydney Central Clinic",
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime || "10:00 AM",
      appointmentType: body.appointmentType || "General Consultation",
      status: body.status || "requested",
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemoData: false,
    };

    const updated = [newApt, ...appointments];
    saveLiveAppointments(updated);

    return NextResponse.json({
      success: true,
      message: "Appointment record saved.",
      data: newApt,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process appointment" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }
    if (id === "all") {
      saveLiveAppointments([]);
      return NextResponse.json({ success: true, message: "All appointments cleared.", count: 0 });
    }
    const appointments = getLiveAppointments();
    const updated = appointments.filter((a) => a.id !== id);
    saveLiveAppointments(updated);
    return NextResponse.json({ success: true, message: "Appointment deleted permanently.", count: updated.length });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
