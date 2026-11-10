const nodemailer = require("nodemailer");

async function main() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.error("Please configure SMTP_USER and SMTP_PASS in .env.local");
    process.exit(1);
  }

  console.log(`Testing SMTP connection on ${host}:${port}...`);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
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
    subject: "MIRA Ops Healthcare - Test Notification",
    text: "MIRA Ops Healthcare test email verification.",
  });

  console.log("SUCCESS_MESSAGE_ID:", info.messageId);
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
