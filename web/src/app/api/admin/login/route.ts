import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ADMIN_COOKIE_NAME, SESSION_COOKIE_MAX_AGE, createSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return NextResponse.json(
      { error: "admin_not_configured", message: "ADMIN_PASSWORD_HASH is not set on the server." },
      { status: 500 },
    );
  }

  const { password } = await request.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "missing_password" }, { status: 400 });
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  return response;
}
