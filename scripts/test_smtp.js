const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// Automatically load environment variables from .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

async function main() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.error("❌ ERROR: SMTP_USER or SMTP_PASS missing in .env.local");
    process.exit(1);
  }

  console.log(`📡 Connecting to Gmail SMTP via ${host}:${port} (SSL)...`);
  console.log(`👤 Authenticating as: ${user}`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465 || host === "smtp.gmail.com",
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: `"MIRA Ops Healthcare" <${user}>`,
    to: user,
    subject: "🏥 MIRA Ops Live SMTP Test Dispatch",
    text: "MIRA Ops Healthcare automated email dispatch test passed successfully!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #8DB9F0; border-radius: 10px; max-width: 580px;">
        <h2 style="color: #25283A; border-bottom: 2px solid #8DB9F0; padding-bottom: 8px;">🏥 MIRA Ops Healthcare</h2>
        <p style="color: #248A63; font-weight: bold; font-size: 16px;">✓ Real Gmail SMTP Verification Succeeded!</p>
        <p>Your Google App Password is authenticated and fully connected to MIRA Robotic Dispatch.</p>
        <div style="background-color: #F8F8FC; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #74778A;">
          Host: ${host}:${port} (SSL)<br/>
          Authenticated User: ${user}<br/>
          Delivery Timestamp: ${new Date().toLocaleString()}
        </div>
      </div>
    `,
  });

  console.log("✅ EMAIL_DELIVERY_SUCCESS!");
  console.log("📬 Google Message ID:", info.messageId);
}

main().catch((err) => {
  console.error("❌ SMTP Delivery Failed:", err.message);
  process.exit(1);
});
