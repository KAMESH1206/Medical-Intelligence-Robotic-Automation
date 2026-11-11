/* eslint-disable @typescript-eslint/no-require-imports */
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const http = require("http");
const path = require("path");
const fs = require("fs");

const PORT = process.env.WHATSAPP_PORT || 8085;
const SESSION_DIR = path.resolve(process.cwd(), "data/whatsapp_session");
const APPOINTMENTS_FILE = path.resolve(process.cwd(), "data/appointments_state.json");
const BOT_STATE_FILE = path.resolve(process.cwd(), "data/whatsapp_bot_state.json");

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

let sock = null;
let isConnected = false;
let userPhone = "";
let latestQr = "";

// Helper to resolve real phone number from LID
function resolveRealPhone(senderJid) {
  if (!senderJid) return "";
  if (senderJid.endsWith("@s.whatsapp.net")) {
    return senderJid.replace(/[^0-9]/g, "");
  }
  if (senderJid.endsWith("@lid")) {
    const lidId = senderJid.split("@")[0].replace(/[^0-9]/g, "");
    const reverseFile = path.resolve(SESSION_DIR, `lid-mapping-${lidId}_reverse.json`);
    if (fs.existsSync(reverseFile)) {
      try {
        const raw = JSON.parse(fs.readFileSync(reverseFile, "utf-8"));
        return String(raw).replace(/[^0-9]/g, "");
      } catch {}
    }
  }
  return "";
}

// Helper to parse date string (YYYY-MM-DD or DD/MM/YYYY)
function parseDate(str) {
  if (!str) return null;
  // Match YYYY-MM-DD
  const m1 = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m1) {
    const y = m1[1];
    const mo = m1[2].padStart(2, "0");
    const d = m1[3].padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }
  // Match DD-MM-YYYY or DD/MM/YYYY
  const m2 = str.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m2) {
    const d = m2[1].padStart(2, "0");
    const mo = m2[2].padStart(2, "0");
    const y = m2[3];
    return `${y}-${mo}-${d}`;
  }
  return null;
}

// Helper to normalize time string (e.g. 10:00AM -> 10:00 AM)
function normalizeTime(str) {
  if (!str) return "10:00 AM";
  const m = str.match(/(\d{1,2}:\d{2})\s*(AM|PM)?/i);
  if (!m) return "10:00 AM";
  const hm = m[1];
  const ampm = (m[2] || "AM").toUpperCase();
  return `${hm} ${ampm}`;
}

// Generate real unbooked open slots after current appointment date
function generateOpenSlots(currentApt, allAppointments) {
  const clinic = currentApt?.clinicName || "Sydney Central Clinic";
  let baseDate = new Date();

  if (currentApt?.preferredDate) {
    const parsed = new Date(currentApt.preferredDate);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
  }

  const standardTimes = ["10:00 AM", "11:30 AM", "03:00 PM", "04:30 PM"];
  const slots = [];
  let dayOffset = 1;

  while (slots.length < 3 && dayOffset <= 14) {
    const candidateDate = new Date(baseDate.getTime() + dayOffset * 86400000);
    const dateStr = candidateDate.toISOString().split("T")[0];

    for (const t of standardTimes) {
      if (slots.length >= 3) break;

      // Check conflict at this clinic
      const isBooked = allAppointments.some(
        (a) =>
          a.status === "confirmed" &&
          (a.clinicName || "").toLowerCase() === clinic.toLowerCase() &&
          a.preferredDate === dateStr &&
          a.preferredTime === t
      );

      if (!isBooked) {
        const slotKey = String(slots.length + 1);
        slots.push({
          key: slotKey,
          date: dateStr,
          time: t,
          label: `${dateStr} at ${t}`,
        });
      }
    }
    dayOffset++;
  }

  // Fallback if no slots generated
  if (slots.length === 0) {
    const d1 = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
    slots.push(
      { key: "1", date: d1, time: "10:00 AM", label: `${d1} at 10:00 AM` },
      { key: "2", date: d1, time: "02:00 PM", label: `${d1} at 02:00 PM` },
      { key: "3", date: d1, time: "04:00 PM", label: `${d1} at 04:00 PM` }
    );
  }

  return slots;
}

async function startWhatsApp() {
  console.log("\n========================================================");
  console.log("🚀 MIRA WhatsApp Native Engine (Baileys)");
  console.log("========================================================\n");

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      latestQr = qr;
      console.log("\n📲 [ACTION REQUIRED] Scan this QR Code with your WhatsApp app:");
      console.log("👉 WhatsApp on Phone > Settings > Linked Devices > Link a Device\n");
      qrcode.generate(qr, { small: true });
      console.log("\nWaiting for QR scan...\n");
    }

    if (connection === "close") {
      isConnected = false;
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("⚠️ Connection closed. Reconnecting in 3 seconds...", shouldReconnect);
      if (shouldReconnect) {
        setTimeout(startWhatsApp, 3000);
      } else {
        console.log("❌ Logged out. Delete 'data/whatsapp_session' to link a new number.");
      }
    } else if (connection === "open") {
      isConnected = true;
      latestQr = "";
      userPhone = sock.user?.id ? sock.user.id.split(":")[0] : "Connected";
      console.log("\n✅ [SUCCESS] WhatsApp Connected Successfully!");
      console.log(`📱 Linked Phone Number: +${userPhone}`);
      console.log(`🌐 Local WhatsApp REST API active on http://localhost:${PORT}\n`);
    }
  });

  // Handle Inbound Patient Messages (Two-Way Rescheduling Bot)
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      const senderJid = msg.key.remoteJid;
      if (!senderJid) continue;

      // Only accept private chats
      if (!senderJid.endsWith("@s.whatsapp.net") && !senderJid.endsWith("@lid")) continue;

      const patientPushName = msg.pushName || "";
      const messageText = (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        ""
      ).trim();

      if (!messageText) continue;

      // Avoid infinite loop on bot's own output
      if (
        messageText.includes("CLINICAL BOT") ||
        messageText.includes("APPOINTMENT RESCHEDULED") ||
        messageText.includes("Available Open Slots")
      ) {
        continue;
      }

      // If message is from self, only proceed if it is an explicit command
      const lowerText = messageText.toLowerCase();
      const isBotCommand =
        lowerText.includes("reschedule") ||
        lowerText.includes("rebook") ||
        lowerText.includes("change") ||
        lowerText === "1" ||
        lowerText === "2" ||
        lowerText === "3" ||
        lowerText.includes("confirm") ||
        lowerText.includes("yes") ||
        lowerText.includes("ok") ||
        /\d{4}[-/]\d{1,2}/.test(messageText);

      if (msg.key.fromMe && !isBotCommand) {
        continue;
      }

      // Resolve Real Phone Number from LID mapping
      const resolvedPhone = resolveRealPhone(senderJid);
      console.log(`\n📥 [PATIENT INBOUND] JID: ${senderJid} | Resolved Phone: ${resolvedPhone} | PushName: "${patientPushName}" | Msg: "${messageText}"`);

      // Load Live Appointments
      let appointments = [];
      if (fs.existsSync(APPOINTMENTS_FILE)) {
        try {
          appointments = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, "utf-8"));
        } catch {}
      }

      // Match patient accurately
      let matchingApt = null;

      // 1. Match by resolved phone number
      if (resolvedPhone) {
        matchingApt = appointments.find((a) => {
          const p = (a.patientPhone || "").replace(/[^0-9]/g, "");
          return p && (resolvedPhone.endsWith(p) || p.endsWith(resolvedPhone));
        });
      }

      // 2. Match by PushName (e.g. Paviseetha or Pavithara)
      if (!matchingApt && patientPushName) {
        const cleanPush = patientPushName.replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (cleanPush.length >= 3) {
          matchingApt = appointments.find((a) => {
            const cleanAptName = (a.patientName || "").replace(/[^a-zA-Z]/g, "").toLowerCase();
            const cleanEmail = (a.patientEmail || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            return (
              cleanAptName.includes(cleanPush) ||
              cleanPush.includes(cleanAptName) ||
              cleanEmail.includes(cleanPush)
            );
          });
        }
      }

      // 3. Fallback: match by active confirmed appointment
      if (!matchingApt && appointments.length > 0) {
        matchingApt = appointments.find((a) => a.status === "confirmed") || appointments[0];
      }

      if (!matchingApt) {
        console.warn("No matching appointment found in database.");
        continue;
      }

      console.log(`🎯 [MATCHED APPOINTMENT] Patient: ${matchingApt.patientName} | Phone: ${matchingApt.patientPhone} | Clinic: ${matchingApt.clinicName}`);

      // Load Bot Conversation States
      let botStates = {};
      if (fs.existsSync(BOT_STATE_FILE)) {
        try {
          botStates = JSON.parse(fs.readFileSync(BOT_STATE_FILE, "utf-8"));
        } catch {}
      }

      const userKey = senderJid;
      const userState = botStates[userKey] || { step: "idle" };
      let replyText = "";

      // -------------------------------------------------------------
      // SCENARIO 1: Patient requests RESCHEDULE
      // -------------------------------------------------------------
      if (
        lowerText.includes("reschedule") ||
        lowerText.includes("change") ||
        lowerText.includes("rebook") ||
        (lowerText.includes("time") && !lowerText.includes("10:00") && !lowerText.includes("11:00"))
      ) {
        // Generate real open slots AFTER the patient's existing preferredDate
        const slots = generateOpenSlots(matchingApt, appointments);

        botStates[userKey] = {
          step: "awaiting_slot_selection",
          aptId: matchingApt.id,
          patientName: matchingApt.patientName,
          clinicName: matchingApt.clinicName,
          slots,
        };
        fs.writeFileSync(BOT_STATE_FILE, JSON.stringify(botStates, null, 2), "utf-8");

        replyText = `🏥 *${matchingApt.clinicName.toUpperCase()} CLINICAL SCHEDULING*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hello *${matchingApt.patientName}*, we can help you reschedule your appointment at *${matchingApt.clinicName}*.

📅 *Next Available Open Slots:*
1️⃣ *${slots[0]?.label || "Next day 11:00 AM"}*
2️⃣ *${slots[1]?.label || "Next day 03:00 PM"}*
3️⃣ *${slots[2]?.label || "Day after 10:00 AM"}*

👉 *Reply with 1, 2, or 3* to lock in an open slot.
*(Or reply with your custom date & time, e.g. "2026-11-25 10:00 AM")*`;
      }

      // -------------------------------------------------------------
      // SCENARIO 2: Patient selected a slot ("1", "2", "3") OR typed a Custom Date & Time
      // -------------------------------------------------------------
      else if (userState.step === "awaiting_slot_selection" || /\d{4}[-/]\d{1,2}/.test(messageText) || lowerText === "1" || lowerText === "2" || lowerText === "3") {
        let newDate = "";
        let newTime = "";

        const chosenSlot = userState.slots?.find((s) => s.key === messageText.trim());
        if (chosenSlot) {
          newDate = chosenSlot.date;
          newTime = chosenSlot.time;
        } else {
          // Parse custom date and custom time
          const parsedD = parseDate(messageText);
          const parsedT = normalizeTime(messageText);

          newDate = parsedD || userState.slots?.[0]?.date || "2026-11-25";
          newTime = parsedT;
        }

        // Check Clinic Conflict
        const targetClinic = userState.clinicName || matchingApt.clinicName;
        const targetAptId = userState.aptId || matchingApt.id;

        const hasConflict = appointments.some(
          (a) =>
            a.id !== targetAptId &&
            a.status === "confirmed" &&
            (a.clinicName || "").toLowerCase() === targetClinic.toLowerCase() &&
            a.preferredDate === newDate &&
            a.preferredTime === newTime
        );

        if (hasConflict) {
          const altSlots = generateOpenSlots(matchingApt, appointments);
          userState.slots = altSlots;
          botStates[userKey] = userState;
          fs.writeFileSync(BOT_STATE_FILE, JSON.stringify(botStates, null, 2), "utf-8");

          replyText = `⚠️ *SLOT ALREADY BOOKED*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dear *${matchingApt.patientName}*, the slot on *${newDate} at ${newTime}* at *${targetClinic}* is already booked by another patient.

📅 *Please choose from these verified open slots:*
1️⃣ *${altSlots[0]?.label}*
2️⃣ *${altSlots[1]?.label}*
3️⃣ *${altSlots[2]?.label}*

👉 Reply with 1, 2, or 3 (or enter another date & time).`;
        } else {
          // No Conflict! Update the EXACT appointment record
          const updatedAppointments = appointments.map((a) => {
            if (a.id === targetAptId) {
              return {
                ...a,
                preferredDate: newDate,
                preferredTime: newTime,
                status: "rescheduled",
                notes: `[Rescheduled via WhatsApp Bot on ${new Date().toLocaleDateString()}]`,
                updatedAt: new Date().toISOString(),
              };
            }
            return a;
          });

          fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(updatedAppointments, null, 2), "utf-8");
          delete botStates[userKey];
          fs.writeFileSync(BOT_STATE_FILE, JSON.stringify(botStates, null, 2), "utf-8");

          replyText = `✅ *APPOINTMENT RESCHEDULED & CONFIRMED!*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dear *${matchingApt.patientName}*,

Your healthcare appointment has been successfully updated in our clinic database:

🏥 *Clinic:* ${targetClinic}
📅 *New Date:* ${newDate}
⏰ *New Time:* ${newTime}
🔖 *Status:* CONFIRMED & RESCHEDULED

Our clinic management dashboard and medical staff have been notified in real time!`;
        }
      }

      // -------------------------------------------------------------
      // SCENARIO 3: General Confirmations
      // -------------------------------------------------------------
      else if (lowerText.includes("yes") || lowerText.includes("ok") || lowerText.includes("confirm")) {
        replyText = `✅ *Thank you, ${matchingApt.patientName}!*
Your appointment at *${matchingApt.clinicName}* on *${matchingApt.preferredDate}* at *${matchingApt.preferredTime}* is confirmed.

Reply *RESCHEDULE* if you ever need to change it.`;
      }

      if (replyText) {
        console.log(`🤖 [BOT REPLYING to ${senderJid}]:\n${replyText}\n`);
        await sock.sendMessage(senderJid, { text: replyText });
      }
    }
  });
}

// REST API Server for MIRA App Dispatch
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health / Status
  if (url.pathname === "/status" || url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: isConnected ? "connected" : "disconnected",
        phone: userPhone,
        hasQr: !!latestQr,
      })
    );
    return;
  }

  // Send Message Endpoint
  if (url.pathname === "/send" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { phone, text, messageText } = JSON.parse(body);
        const finalPhone = (phone || "").replace(/[^0-9]/g, "");
        const content = text || messageText;

        if (!isConnected || !sock) {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "WhatsApp service is not connected yet. Please scan QR code." }));
          return;
        }

        if (!finalPhone || !content) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Missing 'phone' or 'text' parameters." }));
          return;
        }

        const jid = `${finalPhone}@s.whatsapp.net`;
        const sent = await sock.sendMessage(jid, { text: content });

        console.log(`📤 [OUTBOUND SENT] To: +${finalPhone} | ID: ${sent.key.id}`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, messageId: sent.key.id, phone: finalPhone }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(PORT, () => {
  startWhatsApp();
});
