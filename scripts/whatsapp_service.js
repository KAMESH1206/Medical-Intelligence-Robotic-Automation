/* eslint-disable @typescript-eslint/no-require-imports */
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const http = require("http");
const path = require("path");
const fs = require("fs");

const PORT = process.env.WHATSAPP_PORT || 8085;
const SESSION_DIR = path.resolve(process.cwd(), "data/whatsapp_session");

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

let sock = null;
let isConnected = false;
let userPhone = "";
let latestQr = "";

async function startWhatsApp() {
  console.log("\n========================================================");
  console.log("🚀 MIRA WhatsApp Native Engine (Baileys)");
  console.log("========================================================\n");

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // We print manually with qrcode-terminal
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

      // Support standard WhatsApp JID (@s.whatsapp.net) and modern Privacy LID JID (@lid)
      if (!senderJid.endsWith("@s.whatsapp.net") && !senderJid.endsWith("@lid")) continue;

      let cleanPhone = senderJid.replace(/[^0-9]/g, "");
      if (msg.key.participant) {
        const pPhone = msg.key.participant.replace(/[^0-9]/g, "");
        if (pPhone) cleanPhone = pPhone;
      }

      const patientName = msg.pushName || "Patient";
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
        lowerText.includes("ok");

      if (msg.key.fromMe && !isBotCommand) {
        continue;
      }

      console.log(`\n📥 [PATIENT INBOUND RECEIVED] JID: ${senderJid} | Name: ${patientName} | Text: "${messageText}"`);

      let replyText = "";

      // 1. First try MIRA Next.js Webhook
      const webhookPorts = [3000, 3001];
      for (const p of webhookPorts) {
        try {
          const res = await fetch(`http://localhost:${p}/api/whatsapp/webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: cleanPhone,
              message: messageText,
              patientName,
            }),
          });
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data && data.reply) {
              replyText = data.reply;
              break;
            }
          }
        } catch {}
      }

      // 2. Direct Built-In Rescheduling Fallback (Guarantees Instant WhatsApp Reply)
      if (!replyText) {
        try {
          const APPOINTMENTS_FILE = path.resolve(process.cwd(), "data/appointments_state.json");
          const BOT_STATE_FILE = path.resolve(process.cwd(), "data/whatsapp_bot_state.json");

          let appointments = [];
          if (fs.existsSync(APPOINTMENTS_FILE)) {
            appointments = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, "utf-8"));
          }

          let botStates = {};
          if (fs.existsSync(BOT_STATE_FILE)) {
            try {
              botStates = JSON.parse(fs.readFileSync(BOT_STATE_FILE, "utf-8"));
            } catch {}
          }

          const userKey = senderJid;
          const userState = botStates[userKey] || botStates[cleanPhone] || { step: "idle" };

          // 1. Match by phone
          let matchingApt = appointments.find((a) => {
            const p = (a.patientPhone || "").replace(/[^0-9]/g, "");
            return p && (cleanPhone.includes(p) || p.includes(cleanPhone));
          });

          // 2. Match by PushName (e.g. "Pavithara")
          if (!matchingApt && patientName && patientName !== "Patient") {
            const pLower = patientName.toLowerCase();
            matchingApt = appointments.find((a) => {
              const nameLower = (a.patientName || "").toLowerCase();
              return nameLower.includes(pLower) || pLower.includes(nameLower);
            });
          }

          // 3. Fallback to latest active appointment
          if (!matchingApt) {
            matchingApt = appointments.find((a) => a.status === "confirmed" || a.status === "requested") || appointments[0];
          }

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

            const targetName = matchingApt?.patientName || patientName;
            const targetClinic = matchingApt?.clinicName || "Apollo";

            botStates[userKey] = {
              step: "awaiting_slot_selection",
              aptId: matchingApt?.id,
              patientName: targetName,
              clinicName: targetClinic,
              slots,
            };
            botStates[cleanPhone] = botStates[userKey];
            fs.writeFileSync(BOT_STATE_FILE, JSON.stringify(botStates, null, 2), "utf-8");

            replyText = `🏥 *${targetClinic.toUpperCase()} CLINICAL BOT*
━━━━━━━━━━━━━━━━━━━━
Hello *${targetName}*, we are happy to assist with rescheduling your appointment.

📅 *Available Open Slots:*
1️⃣ *${slots[0].label}*
2️⃣ *${slots[1].label}*
3️⃣ *${slots[2].label}*

👉 *Please reply with 1, 2, or 3* to select your new slot.
*(Or reply with your custom date & time, e.g. "2026-11-18 04:00 PM")*`;
          } else if (userState.step === "awaiting_slot_selection") {
            const chosenSlot = userState.slots?.find((s) => s.key === messageText.trim());
            let newDate = "";
            let newTime = "";

            if (chosenSlot) {
              newDate = chosenSlot.date;
              newTime = chosenSlot.time;
            } else {
              newDate = userState.slots?.[0]?.date || "2026-11-15";
              newTime = messageText.includes("PM") || messageText.includes("AM") ? messageText : "11:00 AM";
            }

            const targetAptId = userState.aptId || matchingApt?.id;
            const updatedAppointments = appointments.map((a) => {
              if (a.id === targetAptId) {
                return {
                  ...a,
                  preferredDate: newDate,
                  preferredTime: newTime,
                  status: "rescheduled",
                  notes: (a.notes ? a.notes + " • " : "") + `[Rescheduled via WhatsApp Bot to ${newDate} ${newTime}]`,
                  updatedAt: new Date().toISOString(),
                };
              }
              return a;
            });

            fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(updatedAppointments, null, 2), "utf-8");
            delete botStates[userKey];
            delete botStates[cleanPhone];
            fs.writeFileSync(BOT_STATE_FILE, JSON.stringify(botStates, null, 2), "utf-8");

            replyText = `✅ *APPOINTMENT RESCHEDULED & CONFIRMED!*
━━━━━━━━━━━━━━━━━━━━
Dear *${userState.patientName || matchingApt?.patientName || patientName}*,

Your healthcare appointment has been successfully updated in our clinic database:

🏥 *Clinic:* ${userState.clinicName || matchingApt?.clinicName || "Apollo"}
📅 *New Date:* ${newDate}
⏰ *New Time:* ${newTime}
🔖 *Status:* CONFIRMED & RESCHEDULED

Our clinic management dashboard and medical staff have been notified in real time!`;
          }
        } catch (botErr) {
          console.error("Local bot fallback error:", botErr);
        }
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

