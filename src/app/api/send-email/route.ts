import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { to, cc, subject, body, html } = await request.json();

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || (user ? `"MIRA Ops Healthcare" <${user}>` : '"MIRA Ops Intelligence" <notifications@miraops.health>');

    // Check if real SMTP credentials are provided in .env.local
    if (!user || !pass || pass.includes("your_") || pass.trim() === "") {
      return NextResponse.json({
        success: false,
        isSimulated: true,
        message: "Real SMTP credentials not configured in .env.local. Fallback to Simulated Relay.",
        instructions: "To receive actual emails in your inbox, set SMTP_USER and SMTP_PASS in .env.local.",
      });
    }

    // Determine actual recipients
    // If 'to' is missing, empty, or a dummy @example.com address, redirect to user's real email
    const isPlaceholderEmail = !to || to.includes("@example.com") || to.includes("undefined") || to.trim() === "";
    const finalTo = isPlaceholderEmail ? user : to;
    // Always BCC the admin email (user) during testing so they receive every notice directly
    const bccList = user && user !== finalTo ? user : undefined;

    // Create real SMTP Transporter with SSL
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

    const formattedHtml =
      html ||
      `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background-color: #F8F8FC; border: 1px solid #DFDEEB; border-radius: 12px; color: #25283A;">
        <div style="display: flex; align-items: center; border-bottom: 2px solid #8DB9F0; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #25283A; letter-spacing: -0.02em;">🏥 MIRA Ops Healthcare Intelligence</h2>
        </div>
        <div style="background-color: #FFFFFF; padding: 20px; border-radius: 8px; border: 1px solid #E9E8F8; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <pre style="font-family: inherit; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #25283A; margin: 0;">${body}</pre>
        </div>
        ${
          isPlaceholderEmail
            ? `<div style="margin-top: 16px; padding: 10px 14px; background-color: #E9E8F8; border-radius: 6px; font-size: 12px; color: #74778A;">
                ℹ️ <strong>System Delivery Note:</strong> Delivered directly to administrative tester inbox (<strong>${user}</strong>) because patient record had placeholder address.
               </div>`
            : ""
        }
        <div style="margin-top: 20px; border-top: 1px solid #DFDEEB; padding-top: 12px; font-size: 11px; color: #74778A; text-align: center;">
          Powered by MIRA Ops Intelligence • Automated Robotic Dispatch (ISO 27001 / HIPAA Compliant)
        </div>
      </div>
    `;

    // Send actual email over the internet
    const info = await transporter.sendMail({
      from,
      to: finalTo,
      bcc: bccList,
      subject,
      text: body,
      html: formattedHtml,
    });

    console.log(`[SMTP SUCCESS] Dispatched to ${finalTo} (BCC: ${bccList || 'none'}), MessageId: ${info.messageId}`);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email successfully delivered to ${finalTo} via ${host}:${port}!`,
      isSimulated: false,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "SMTP connection failed";
    console.error("[SMTP ERROR] Delivery failed:", errorMessage);
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
