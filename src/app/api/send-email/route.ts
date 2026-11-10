import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { to, cc, subject, body, html } = await request.json();

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user || '"MIRA Ops Intelligence" <notifications@miraops.health>';

    // Check if real SMTP credentials are provided in .env.local
    if (!user || !pass || pass.includes("your_") || pass.trim() === "") {
      return NextResponse.json({
        success: false,
        isSimulated: true,
        message: "Real SMTP credentials not configured in .env.local. Fallback to Simulated Relay & Mail App.",
        instructions: "To receive actual emails in your inbox, set SMTP_USER and SMTP_PASS in .env.local.",
      });
    }

    // Create real SMTP Transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });

    // Send actual email over the internet
    const info = await transporter.sendMail({
      from,
      to,
      cc: cc || undefined,
      subject,
      text: body,
      html: html || `<pre style="font-family: sans-serif; white-space: pre-wrap; font-size: 13px;">${body}</pre>`,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email successfully delivered to ${to} via ${host}:${port}!`,
      isSimulated: false,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "SMTP connection failed";
    console.error("SMTP Delivery Error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to dispatch email via real SMTP. Check your SMTP_USER and Gmail App Password.",
      },
      { status: 500 }
    );
  }
}
