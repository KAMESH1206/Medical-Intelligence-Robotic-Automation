import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("mira_session")?.value;

  if (!sessionToken || !sessionToken.startsWith("mira_jwt_")) {
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    );
  }

  try {
    const raw = sessionToken.replace("mira_jwt_", "");
    const user = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch {
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    );
  }
}

