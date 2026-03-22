import { NextResponse } from "next/server";

import { getAuthState } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/config";

interface TeamMemberPatchBody {
  profileId?: string;
  isActive?: boolean;
}

async function requireAdmin() {
  const auth = await getAuthState();

  if (!auth.user) {
    return { auth, response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  if (auth.role !== "admin") {
    return { auth, response: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }

  return { auth, response: null };
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) {
    return response;
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "Supabase admin environment is missing." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();

  const [{ data: profilesData, error: profilesError }, { data: producersData, error: producersError }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, email, role, display_name, created_at, is_active")
      .in("role", ["producer", "admin"])
      .order("created_at", { ascending: false }),
    adminClient.from("producers").select("profile_id, artist_name, is_active"),
  ]);

  if (profilesError || producersError) {
    return NextResponse.json(
      {
        error: profilesError?.message ?? producersError?.message ?? "Could not load team members.",
      },
      { status: 400 },
    );
  }

  const producerMap = Object.fromEntries((producersData ?? []).map((producer) => [producer.profile_id, producer]));

  const members = (profilesData ?? []).map((profile) => {
    const producer = producerMap[profile.id];
    return {
      profileId: profile.id,
      email: profile.email,
      role: profile.role,
      displayName: profile.display_name,
      artistName: producer?.artist_name ?? null,
      isActive: producer ? producer.is_active !== false && profile.is_active !== false : profile.is_active !== false,
      createdAt: profile.created_at,
    };
  });

  return NextResponse.json({ members });
}

export async function PATCH(request: Request) {
  const { auth, response } = await requireAdmin();
  if (response) {
    return response;
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "Supabase admin environment is missing." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as TeamMemberPatchBody | null;
  const profileId = body?.profileId?.trim();
  const isActive = body?.isActive;

  if (!profileId || typeof isActive !== "boolean") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (auth.user?.id === profileId && !isActive) {
    return NextResponse.json({ error: "You cannot deactivate your own admin account." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, role")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Team member not found." }, { status: 404 });
  }

  const { error: updateProfileError } = await adminClient
    .from("profiles")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (updateProfileError) {
    return NextResponse.json({ error: updateProfileError.message }, { status: 400 });
  }

  if (profile.role === "producer") {
    const { error: updateProducerError } = await adminClient
      .from("producers")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("profile_id", profileId);

    if (updateProducerError) {
      return NextResponse.json({ error: updateProducerError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
