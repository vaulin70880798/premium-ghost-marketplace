import { NextResponse } from "next/server";

import { getAuthState } from "@/lib/auth/server";

export async function POST(request: Request) {
  const auth = await getAuthState();

  if (!auth.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 400 });
  }

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const expectedCode = process.env.ADMIN_ACCESS_CODE;
  if (!expectedCode) {
    return NextResponse.json({ error: "Admin code is not configured." }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const code = body?.code?.trim();

  if (!code || code !== expectedCode) {
    return NextResponse.json({ error: "Invalid admin code." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
