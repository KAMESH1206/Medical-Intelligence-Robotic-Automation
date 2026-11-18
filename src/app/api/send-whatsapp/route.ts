import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, messageText, patientName, clinicName, date, time } = await request.json();

    // Clean phone number: remove +, spaces, dashes, etc.
    let cleanPhone = (phone || "").replace(/[^0-9]/g, "");

    // Fallback: If dummy number (9876543210) or empty, check .env.local for WHATSAPP_PHONE
    const configuredPhone = (process.env.WHATSAPP_PHONE || "917397186456").replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.includes("9876543210") || cleanPhone.length < 10) {
      cleanPhone = configuredPhone;
    }

    // Default to Indian country code 91 if 10 digits provided without country code
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const encodedText = encodeURIComponent(messageText || `Appointment confirmed for ${patientName} at ${clinicName} on ${date} at ${time}.`);
    const directUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

    // 0. Primary: WhatsApp Engine (Cloud Tunnel or Local Port 8085)
    const whatsappEngineUrl = process.env.WHATSAPP_SERVICE_URL || "http://localhost:8085";
    try {
      const nativeRes = await fetch(`${whatsappEngineUrl}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          text: messageText || `Appointment confirmed for ${patientName} at ${clinicName} on ${date} at ${time}.`,
        }),
      });
      if (nativeRes.ok) {
        const nativeData = await nativeRes.json();
        console.log(`[NATIVE WHATSAPP SUCCESS] Dispatched from phone to +${cleanPhone}, ID: ${nativeData.messageId}`);
        return NextResponse.json({
          success: true,
          provider: "Native WhatsApp Engine (Your Phone: +91 73971 86456)",
          messageId: nativeData.messageId,
          phone: cleanPhone,
          message: `Automated WhatsApp delivered to +${cleanPhone} directly from your WhatsApp number!`,
          directUrl,
        });
      }
    } catch {
      // Local engine not active, fallback to direct url
    }

    // 1. Fallback: Check for n8n Workflow Automation Webhook
    const n8nWebhookUrl = process.env.N8N_WHATSAPP_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        const n8nRes = await fetch(n8nWebhookUrl.trim(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "appointment_notification",
            phone: cleanPhone,
            patientName,
            clinicName,
            date,
            time,
            messageText,
            timestamp: new Date().toISOString(),
          }),
        });

        if (n8nRes.ok) {
          return NextResponse.json({
            success: true,
            provider: "n8n Automation Engine",
            phone: cleanPhone,
            message: `Automated WhatsApp payload delivered to n8n Webhook for +${cleanPhone}!`,
            directUrl,
          });
        }
      } catch (n8nErr) {
        console.warn("n8n Webhook dispatch failed:", n8nErr);
      }
    }

    // 3. Fallback: Return Universal WhatsApp Link
    return NextResponse.json({
      success: true,
      provider: "Universal WhatsApp Protocol",
      phone: cleanPhone,
      isDirectLaunch: true,
      directUrl,
      message: `WhatsApp alert prepared for +${cleanPhone}!`,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Failed to prepare WhatsApp message";
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
