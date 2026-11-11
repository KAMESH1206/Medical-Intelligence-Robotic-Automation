import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, messageText, patientName, clinicName, date, time } = await request.json();

    // Clean phone number: remove +, spaces, dashes, etc.
    let cleanPhone = (phone || "").replace(/[^0-9]/g, "");

    // Fallback: If dummy number (9876543210) or empty, check .env.local for WHATSAPP_PHONE
    const configuredPhone = (process.env.WHATSAPP_PHONE || "").replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.includes("9876543210") || cleanPhone.length < 10) {
      if (configuredPhone) {
        cleanPhone = configuredPhone;
      }
    }

    // Default to Indian country code 91 if 10 digits provided without country code
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const encodedText = encodeURIComponent(messageText || `Appointment confirmed for ${patientName} at ${clinicName} on ${date} at ${time}.`);
    const directUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

    // 1. Check for Free CallMeBot Background API
    const callmebotApiKey = process.env.CALLMEBOT_API_KEY;
    if (callmebotApiKey && cleanPhone) {
      try {
        const cmbUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${callmebotApiKey.trim()}`;
        const cmbRes = await fetch(cmbUrl, { method: "GET" });
        if (cmbRes.ok) {
          return NextResponse.json({
            success: true,
            provider: "CallMeBot",
            phone: cleanPhone,
            message: `Automated WhatsApp delivered to +${cleanPhone} via CallMeBot!`,
            directUrl,
          });
        }
      } catch (e) {
        console.warn("CallMeBot dispatch failed:", e);
      }
    }

    // 2. Check for Twilio WhatsApp Credentials
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

    if (twilioSid && twilioAuth && cleanPhone) {
      try {
        const authHeader = Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");
        const bodyParams = new URLSearchParams({
          From: twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`,
          To: `whatsapp:+${cleanPhone}`,
          Body: messageText,
        });

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        });

        if (twilioRes.ok) {
          const twilioData = await twilioRes.json();
          return NextResponse.json({
            success: true,
            provider: "Twilio",
            messageId: twilioData.sid,
            phone: cleanPhone,
            message: `Automated WhatsApp delivered to +${cleanPhone} via Twilio API!`,
            directUrl,
          });
        }
      } catch (twErr) {
        console.warn("Twilio WhatsApp dispatch failed:", twErr);
      }
    }

    // 3. Check for Meta Cloud API Credentials
    const metaToken = process.env.META_WHATSAPP_TOKEN;
    const metaPhoneId = process.env.META_PHONE_ID;
    if (metaToken && metaPhoneId && cleanPhone) {
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v19.0/${metaPhoneId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${metaToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "text",
            text: { body: messageText },
          }),
        });

        if (metaRes.ok) {
          return NextResponse.json({
            success: true,
            provider: "Meta Cloud API",
            phone: cleanPhone,
            message: `Automated WhatsApp delivered to +${cleanPhone} via Meta Cloud API!`,
            directUrl,
          });
        }
      } catch (metaErr) {
        console.warn("Meta Cloud API dispatch failed:", metaErr);
      }
    }

    // Default Fallback: Instant Universal WhatsApp Link
    return NextResponse.json({
      success: true,
      provider: "Universal WhatsApp Protocol",
      phone: cleanPhone,
      isDirectLaunch: true,
      directUrl,
      message: `WhatsApp message prepared for +${cleanPhone}! Opening WhatsApp conversation...`,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Failed to prepare WhatsApp message";
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
