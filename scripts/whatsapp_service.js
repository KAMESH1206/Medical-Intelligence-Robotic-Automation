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
      console.log("⚠️ Connection closed. Reconnecting...", shouldReconnect);
      if (shouldReconnect) {
        startWhatsApp();
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
      if (msg.key.fromMe) continue; // Ignore own messages
      const senderJid = msg.key.remoteJid;
      if (!senderJid || !senderJid.endsWith("@s.whatsapp.net")) continue;

      const cleanPhone = senderJid.replace("@s.whatsapp.net", "");
      const patientName = msg.pushName || "Patient";
      const messageText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

      if (!messageText.trim()) continue;

      console.log(`\n📥 [PATIENT INBOUND] From: +${cleanPhone} (${patientName}): "${messageText}"`);

      // Forward to MIRA Next.js Webhook
      try {
        const webhookPorts = [3000, 3001];
        let replyText = "";

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

        if (replyText) {
          console.log(`🤖 [BOT REPLYING to +${cleanPhone}]:\n${replyText}\n`);
          await sock.sendMessage(senderJid, { text: replyText });
        }
      } catch (err) {
        console.error("Failed to process inbound webhook:", err);
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
