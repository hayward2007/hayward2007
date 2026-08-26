import { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { noStoreJson } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const response = noStoreJson({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
