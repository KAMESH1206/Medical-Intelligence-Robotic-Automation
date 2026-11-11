import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SEED_APPOINTMENTS } from "@/lib/demoData";
import type { Appointment } from "@/lib/types";

const APPOINTMENTS_FILE = path.resolve(process.cwd(), "data/appointments_state.json");
const CONVERSATION_STATE_FILE = path.resolve(process.cwd(), "data/whatsapp_bot_state.json");

// Helper to load live appointments
function getAppointments(): Appointment[] {
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      const data = fs.readFileSync(APPOINTMENTS_FILE, "utf-8");
      return JSON.parse(data);
    } else {
      fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(SEED_APPOINTMENTS, null, 2), "utf-8");
      return SEED_APPOINTMENTS;
    }
  } catch (e) {
    console.warn("Could not read appointments file, using seeds:", e);
  }
  return SEED_APPOINTMENTS;
}

// Helper to save live appointments
function saveAppointments(apts: Appointment[]) {
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(apts, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save appointments:", e);
  }
}

// Helper for bot states
function getBotStates(): Record<string, any> {
  try {
    if (fs.existsSync(CONVERSATION_STATE_FILE)) {
      const text = fs.readFileSync(CONVERSATION_STATE_FILE, "utf-8").trim();
      if (text) {
        return JSON.parse(text);
      }
    }
  } catch (e) {
    console.warn("Error reading bot state:", e);
  }
  return {};
}

function saveBotStates(states: Record<string, any>) {
  try {
    fs.writeFileSync(CONVERSATION_STATE_FILE, JSON.stringify(states, null, 2), "utf-8");
  } catch (e) {
    console.warn("Error saving bot state:", e);
  }
}

export async function POST(request: Request) {
  try {
    let from = "";
    let bodyText = "";
    let profileName = "Patient";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formText = await request.text();
      const params = new URLSearchParams(formText);
      from = params.get("From") || "";
      bodyText = (params.get("Body") || "").trim();
      profileName = params.get("ProfileName") || "Patient";
    } else {
      try {
        const json = await request.json();
        from = json.From || json.from || json.phone || "";
        bodyText = (json.Body || json.body || json.message || "").trim();
        profileName = json.ProfileName || json.patientName || "Patient";
      } catch (jsonErr) {
        console.warn("Could not parse JSON body, reading as text fallback:", jsonErr);
      }
    }

    const cleanPhone = from.replace(/[^0-9]/g, "");
    console.log(`[INBOUND WHATSAPP] From: +${cleanPhone} (${profileName}) | Message: "${bodyText}"`);

    const appointments = getAppointments();
    const botStates = getBotStates();
    const userState = botStates[cleanPhone] || { step: "idle" };

    const lowerText = bodyText.toLowerCase();
    let replyMessage = "";

    // Find the latest active appointment for this patient phone or name
    let matchingApt = appointments.find((a) => {
      const aptPhone = (a.patientPhone || "").replace(/[^0-9]/g, "");
      return aptPhone && (aptPhone.endsWith(cleanPhone) || cleanPhone.endsWith(aptPhone));
    });

    if (!matchingApt && appointments.length > 0) {
      // Fallback: match most recent confirmed or requested appointment
      matchingApt = appointments[0];
    }

    // -------------------------------------------------------------
    // SCENARIO 1: Patient requests RESCHEDULE
    // -------------------------------------------------------------
    if (
      lowerText.includes("reschedule") ||
      lowerText.includes("change") ||
      lowerText.includes("rebook") ||
      lowerText.includes("time") ||
      lowerText.includes("date")
    ) {
      const tomorrow = new Date(Date.now() + 86400000);
      const dayAfter = new Date(Date.now() + 86400000 * 2);

      const d1 = tomorrow.toISOString().split("T")[0];
      const d2 = dayAfter.toISOString().split("T")[0];

      const slots = [
        { key: "1", date: d1, time: "11:00 AM", label: `${d1} at 11:00 AM` },
        { key: "2", date: d1, time: "03:00 PM", label: `${d1} at 03:00 PM` },
        { key: "3", date: d2, time: "10:00 AM", label: `${d2} at 10:00 AM` },
      ];

      botStates[cleanPhone] = {
        step: "awaiting_slot_selection",
        aptId: matchingApt?.id,
        patientName: matchingApt?.patientName || profileName,
        clinicName: matchingApt?.clinicName || "Sydney Central Clinic",
        slots,
      };
      saveBotStates(botStates);

      replyMessage = `🏥 *MIRA HEALTHCARE CLINICAL BOT*
━━━━━━━━━━━━━━━━━━━━
Hello *${matchingApt?.patientName || profileName}*, we are happy to assist with rescheduling your appointment at *${matchingApt?.clinicName || "Sydney Central Clinic"}*.

📅 *Available Open Slots:*
1️⃣ *${slots[0].label}*
2️⃣ *${slots[1].label}*
3️⃣ *${slots[2].label}*

👉 *Please reply with 1, 2, or 3* to select your new slot.
*(Or reply with your custom date & time, e.g. "2026-11-18 04:00 PM")*`;
    }

    // -------------------------------------------------------------
    // SCENARIO 2: Patient selected a slot ("1", "2", "3") or provided new date/time
    // -------------------------------------------------------------
    else if (userState.step === "awaiting_slot_selection") {
      let chosenSlot = userState.slots?.find((s: any) => s.key === bodyText);
      let newDate = "";
      let newTime = "";

      if (chosenSlot) {
        newDate = chosenSlot.date;
        newTime = chosenSlot.time;
      } else {
        // Parse custom input or fallback to slot 1
        newDate = userState.slots?.[0]?.date || "2026-11-15";
        newTime = bodyText.includes("PM") || bodyText.includes("AM") ? bodyText : "11:00 AM";
      }

      // Update Appointment in persistent storage
      const targetAptId = userState.aptId;
      const updatedAppointments = appointments.map((a) => {
        if (a.id === targetAptId || (!targetAptId && a.id === matchingApt?.id)) {
          return {
            ...a,
            preferredDate: newDate,
            preferredTime: newTime,
            status: "rescheduled" as const,
            notes: (a.notes ? a.notes + " • " : "") + `[Rescheduled via WhatsApp Bot on ${new Date().toLocaleDateString()}]`,
            updatedAt: new Date().toISOString(),
          };
        }
        return a;
      });

      saveAppointments(updatedAppointments);

      // Reset state
      delete botStates[cleanPhone];
      saveBotStates(botStates);

      replyMessage = `✅ *APPOINTMENT RESCHEDULED!*
━━━━━━━━━━━━━━━━━━━━
Dear *${userState.patientName || profileName}*,

Your healthcare appointment has been updated in our clinic database:

🏥 *Clinic:* ${userState.clinicName}
📅 *New Date:* ${newDate}
⏰ *New Time:* ${newTime}
🔖 *Status:* CONFIRMED & RESCHEDULED

Our clinic management dashboard and medical staff have been notified in real time. We look forward to seeing you!`;
    }

    // -------------------------------------------------------------
    // SCENARIO 3: General inquiries or confirmations
    // -------------------------------------------------------------
    else if (lowerText.includes("yes") || lowerText.includes("ok") || lowerText.includes("confirm")) {
      replyMessage = `✅ *Thank you, ${matchingApt?.patientName || profileName}!*
Your appointment at *${matchingApt?.clinicName || "the clinic"}* is confirmed for *${matchingApt?.preferredDate || "scheduled date"}* at *${matchingApt?.preferredTime || "scheduled time"}*.

If you need to reschedule at any time, just reply *RESCHEDULE* here.`;
    } else {
      replyMessage = `🏥 *MIRA Operations Intelligence*
Hello *${profileName}*!
• Reply *RESCHEDULE* to view available open dates & choose a new consultation slot.
• Reply *CONFIRM* to lock in your existing scheduled appointment.
• For immediate emergencies, please call emergency services (000 / 911).`;
    }

    const isTwilioForm = contentType.includes("application/x-www-form-urlencoded");

    // If called via Twilio inbound webhook, returning TwiML sends the reply automatically.
    // If called via an external trigger where REST dispatch is desired:
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+17372508034";

    // Return TwiML XML response for Twilio webhook compatibility
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${replyMessage.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Message>
</Response>`;

    if (!isTwilioForm) {
      return NextResponse.json({
        success: true,
        reply: replyMessage,
        twiml: twimlResponse,
      });
    }

    return new Response(twimlResponse, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: unknown) {
    console.error("[WHATSAPP WEBHOOK ERROR]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Allow GET request for verification or health check
export async function GET() {
  return NextResponse.json({
    status: "active",
    bot: "MIRA WhatsApp Two-Way Interactive Rescheduling Bot",
    supportedActions: ["RESCHEDULE", "SLOT_SELECTION (1, 2, 3)", "CONFIRM"],
  });
}
