import { NextResponse } from "next/server";

import { getAuthState } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/config";

interface CreateProducerBody {
  email?: string;
  password?: string;
  displayName?: string;
  artistName?: string;
  role?: "producer" | "admin";
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "Supabase admin environment is missing. Add SUPABASE_SERVICE_ROLE_KEY." },
      { status: 400 },
    );
  }

  const auth = await getAuthState();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as CreateProducerBody | null;

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password?.trim();
  const displayName = body?.displayName?.trim();
  const artistName = body?.artistName?.trim() ?? "";
  const role = body?.role === "admin" ? "admin" : "producer";

  if (!email || !password || !displayName) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  if (role === "producer" && artistName.length === 0) {
    return NextResponse.json({ error: "Artist name is required for producer role." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();

  const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
    },
  });

  if (createError || !createdUser.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Could not create user." },
      { status: 400 },
    );
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await adminClient.from("profiles").upsert(
    {
      id: userId,
      email,
      display_name: displayName,
      role,
      is_active: true,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  if (role === "producer") {
    const { error: producerError } = await adminClient.from("producers").upsert(
      {
        profile_id: userId,
        artist_name: artistName,
        genres: [],
        is_active: true,
      },
      { onConflict: "profile_id" },
    );

    if (producerError) {
      return NextResponse.json({ error: producerError.message }, { status: 400 });
    }
  }

  return NextResponse.json({
    ok: true,
    userId,
    email,
    role,
  });
}
