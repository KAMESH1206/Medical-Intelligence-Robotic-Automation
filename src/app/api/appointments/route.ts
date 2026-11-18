import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SEED_APPOINTMENTS } from "@/lib/demoData";
import type { Appointment } from "@/lib/types";
import {
  supabase,
  getSupabaseAppointments,
  insertSupabaseAppointment,
  updateSupabaseAppointment,
  deleteSupabaseAppointment,
} from "@/lib/supabase";

const APPOINTMENTS_FILE = path.resolve(process.cwd(), "data/appointments_state.json");

function getLiveAppointments(): Appointment[] {
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      const data = fs.readFileSync(APPOINTMENTS_FILE, "utf-8");
      return JSON.parse(data);
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
  // 1. Supabase is the primary Cloud source of truth
  const cloudData = await getSupabaseAppointments();
  if (cloudData !== null) {
    return NextResponse.json({
      success: true,
      count: cloudData.length,
      data: cloudData,
    });
  }

  // 2. Fallback to server local state
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

    // Check action: reset
    if (body.action === "reset") {
      saveLiveAppointments(SEED_APPOINTMENTS);
      return NextResponse.json({ success: true, message: "Appointments reset to seeds.", data: SEED_APPOINTMENTS });
    }

    // Check action: delete
    if (body.action === "delete" && body.id) {
      if (body.id === "all") {
        saveLiveAppointments([]);
        if (supabase) {
          await supabase.from("appointments").delete().neq("id", "");
        }
        return NextResponse.json({ success: true, message: "All appointments deleted.", count: 0 });
      }
      const local = getLiveAppointments().filter((a) => a.id !== body.id);
      saveLiveAppointments(local);
      await deleteSupabaseAppointment(body.id);
      return NextResponse.json({ success: true, message: "Appointment deleted." });
    }

    // Check action: update
    if (body.action === "update" && body.id) {
      const local = getLiveAppointments().map((a) =>
        a.id === body.id ? { ...a, ...body, updatedAt: new Date().toISOString() } : a
      );
      saveLiveAppointments(local);
      await updateSupabaseAppointment(body.id, body);
      return NextResponse.json({ success: true, message: "Appointment updated." });
    }

    // Fetch existing appointments to check conflict
    const existing = (await getSupabaseAppointments()) || getLiveAppointments();

    const conflict = existing.find(
      (a) =>
        a.clinicName?.toLowerCase() === body.clinicName?.toLowerCase() &&
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

    const updated = [newApt, ...getLiveAppointments()];
    saveLiveAppointments(updated);
    await insertSupabaseAppointment(newApt);

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
      if (supabase) {
        await supabase.from("appointments").delete().neq("id", "");
      }
      return NextResponse.json({ success: true, message: "All appointments cleared.", count: 0 });
    }
    const updated = getLiveAppointments().filter((a) => a.id !== id);
    saveLiveAppointments(updated);
    await deleteSupabaseAppointment(id);
    return NextResponse.json({ success: true, message: "Appointment deleted permanently.", count: updated.length });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
