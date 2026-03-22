import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  DEMO_ADMIN_SESSION_COOKIE,
  TEMP_ADMIN_EMAIL,
  TEMP_ADMIN_PASSWORD,
} from "@/lib/auth/demo-admin";

interface Body {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password?.trim();

  if (email !== TEMP_ADMIN_EMAIL || password !== TEMP_ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(DEMO_ADMIN_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}
