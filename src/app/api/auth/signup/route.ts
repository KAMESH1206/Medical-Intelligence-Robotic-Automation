import { NextResponse } from "next/server";
import { createStoredUser, findUserByEmail, type AuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, organization } = body;

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full legal or professional name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid healthcare organizational email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long for healthcare security compliance." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = findUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Valid roles check
    const validRoles: AuthUser["role"][] = [
      "super_admin",
      "healthcare_admin",
      "data_coordinator",
      "operations_executive",
      "viewer",
    ];
    const userRole: AuthUser["role"] = validRoles.includes(role) ? role : "healthcare_admin";

    // Create user in persistent storage
    const newUser = createStoredUser({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
      organization: organization?.trim() || "Clinical Operations Network",
    });

    // Build session token payload
    const sessionToken = `mira_jwt_${Buffer.from(JSON.stringify(newUser)).toString("base64")}`;

    const response = NextResponse.json({
      success: true,
      message: "Healthcare account successfully registered and activated.",
      user: newUser,
      token: sessionToken,
    });

    // Set secure HTTP session cookie
    response.cookies.set("mira_session", sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create healthcare account.",
      },
      { status: 500 }
    );
  }
}

