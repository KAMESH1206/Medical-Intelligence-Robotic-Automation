/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const APPOINTMENTS_FILE = path.resolve(process.cwd(), "data/appointments_state.json");
const CONVERSATION_STATE_FILE = path.resolve(process.cwd(), "data/whatsapp_bot_state.json");

console.log("Checking appointments state file...");
if (!fs.existsSync(APPOINTMENTS_FILE)) {
  console.log("Creating default seed state for appointments...");
  const seeds = [
    {
      id: "apt_001",
      patientId: "pat_001",
      patientName: "Kamesh M R",
      patientEmail: "mrkamesh8@gmail.com",
      patientPhone: "+91 73971 86456",
      clinicName: "Sydney Central Clinic",
      preferredDate: "2026-11-14",
      preferredTime: "10:00 AM",
      appointmentType: "General Consultation",
      status: "confirmed",
      notes: "First test appointment",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
  fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(seeds, null, 2), "utf-8");
}

console.log("Appointments state ready at:", APPOINTMENTS_FILE);
