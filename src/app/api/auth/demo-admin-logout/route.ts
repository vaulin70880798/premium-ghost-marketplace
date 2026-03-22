import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { DEMO_ADMIN_SESSION_COOKIE } from "@/lib/auth/demo-admin";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
