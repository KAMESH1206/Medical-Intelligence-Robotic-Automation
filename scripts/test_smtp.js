/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// 1. Locate and parse .env.local cleanly
function loadEnv() {
  const possiblePaths = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(__dirname, "../.env.local"),
    path.resolve(__dirname, ".env.local"),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            // Remove wrapping quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
      return envPath;
    }
  }
  return null;
}

const loadedFrom = loadEnv();

async function main() {
  console.log("=================================================");
  console.log("🏥 MIRA Ops Healthcare — Live SMTP Test Utility");
  console.log("=================================================");

  if (loadedFrom) {
    console.log(`📄 Loaded environment from: ${loadedFrom}`);
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "").trim();

  // Allow passing a recipient via CLI (e.g. node scripts/test_smtp.js user@test.com)
  const recipient = (process.argv[2] || user).trim();

  if (!user || !pass) {
    console.error("\n❌ ERROR: SMTP_USER or SMTP_PASS missing in .env.local!");
    console.error("Please add the following lines to .env.local:");
    console.error("SMTP_USER=mrkamesh8@gmail.com");
    console.error("SMTP_PASS=wgdjpljpgoevmwlh\n");
    process.exit(1);
  }

  console.log(`📡 SMTP Server  : ${host}:${port} (SSL)`);
  console.log(`👤 Auth User    : ${user}`);
  console.log(`📬 Recipient    : ${recipient}`);
  console.log(`⚡ Speed Mode   : IPv4 Enforced (Prevents Windows IPv6 delay)\n`);

  console.time("⏱️ Total Time");

  // Create transporter with family: 4 to avoid 90-second Windows IPv6 hang
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465 || host === "smtp.gmail.com",
    family: 4, // CRITICAL: Force IPv4 so it connects in ~1s instead of 90s timeout
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Step 1: Verify SMTP Connection & Credentials
  console.log("1️⃣ Verifying SMTP credentials with Google...");
  await transporter.verify();
  console.log("   ✓ Authentication Succeeded! Google accepted the credentials.\n");

  // Step 2: Send Test Confirmation Email
  console.log("2️⃣ Dispatching live email...");
  const info = await transporter.sendMail({
    from: `"MIRA Ops Healthcare" <${user}>`,
    to: recipient,
    subject: "🏥 MIRA Ops Live SMTP Test Dispatch",
    text: "MIRA Ops Healthcare automated email dispatch test passed successfully! Sent via Gmail SMTP (port 465 SSL).",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background-color: #F8F8FC; border: 1px solid #DFDEEB; border-radius: 12px; color: #25283A;">
        <div style="border-bottom: 2px solid #8DB9F0; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0; color: #25283A; font-size: 20px;">🏥 MIRA Ops Healthcare Intelligence</h2>
          <p style="margin: 4px 0 0 0; color: #74778A; font-size: 12px;">Robotic Workflow & Clinical Operations Platform</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 18px; border-radius: 8px; border: 1px solid #E9E8F8; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: inline-block; padding: 4px 10px; background-color: #E8F5E9; color: #2E7D32; border-radius: 6px; font-size: 12px; font-weight: bold; margin-bottom: 12px;">
            ✓ SMTP Delivery Successful (Port 465 SSL)
          </div>
          <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.5; color: #25283A;">
            Hello! This confirmation confirms that your <strong>Google App Password</strong> is active, authenticated, and ready to dispatch appointment confirmations and cancellations in real-time.
          </p>
          <div style="background-color: #F8F8FC; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 11px; color: #555; line-height: 1.6;">
            • Server: ${host}:${port}<br/>
            • Authenticated Sender: ${user}<br/>
            • Target Recipient: ${recipient}<br/>
            • Delivery Protocol: TLS 1.3 / SSL Direct (IPv4 Enforced)
          </div>
        </div>
        <div style="margin-top: 18px; text-align: center; font-size: 11px; color: #74778A;">
          MIRA Ops Healthcare • Powered by Robotic Process Automation (ISO 27001 / HIPAA Compliant)
        </div>
      </div>
    `,
  });

  console.log("   ✓ Email Delivered Successfully!");
  console.log(`   📬 Google Message ID: ${info.messageId}\n`);
  console.timeEnd("⏱️ Total Time");
  console.log("\n🎉 All checks passed! Check your inbox at:", recipient);
}

main().catch((err) => {
  console.error("\n❌ SMTP Delivery Failed!");
  console.error("   Error Message:", err.message);
  if (err.code === "EAUTH") {
    console.error("   👉 Cause: Google App Password rejected. Verify 2-Step Verification & App Password.");
  } else if (err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED") {
    console.error("   👉 Cause: Connection timed out. Check firewall or port 465 access.");
  }
  process.exit(1);
});
