import { NextResponse } from "next/server";

import { getAuthState } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";

interface UpdateTrackBody {
  title?: string;
  genre?: string;
  bpm?: number;
  musicalKey?: string;
  mood?: string;
  description?: string;
  price?: number;
  previewUrl?: string;
  artworkUrl?: string;
  packageUrl?: string;
  status?: "draft" | "pending" | "published" | "rejected";
  exclusivityStatus?: "available" | "sold";
}

async function requireAdmin() {
  const auth = await getAuthState();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ trackId: string }> }) {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 400 });
  }

  const { trackId } = await params;
  const body = (await request.json().catch(() => null)) as UpdateTrackBody | null;

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof body?.title === "string") {
    updatePayload.title = body.title.trim();
  }

  if (typeof body?.genre === "string") {
    updatePayload.genre = body.genre.trim();
  }

  if (typeof body?.bpm === "number") {
    updatePayload.bpm = body.bpm;
  }

  if (typeof body?.musicalKey === "string") {
    updatePayload.musical_key = body.musicalKey.trim();
  }

  if (typeof body?.mood === "string") {
    updatePayload.mood = body.mood.trim();
  }

  if (typeof body?.description === "string") {
    updatePayload.description = body.description;
  }

  if (typeof body?.price === "number") {
    updatePayload.price = body.price;
  }

  if (typeof body?.previewUrl === "string") {
    updatePayload.preview_url = body.previewUrl.trim() || null;
  }

  if (typeof body?.artworkUrl === "string") {
    updatePayload.artwork_url = body.artworkUrl.trim() || null;
  }

  if (typeof body?.packageUrl === "string") {
    updatePayload.package_url = body.packageUrl.trim() || null;
  }

  if (body?.status) {
    updatePayload.status = body.status;
  }

  if (body?.exclusivityStatus) {
    updatePayload.exclusivity_status = body.exclusivityStatus;
  }

  const adminClient = createSupabaseAdminClient();

  const { error } = await adminClient.from("tracks").update(updatePayload).eq("id", trackId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ trackId: string }> }) {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 400 });
  }

  const { trackId } = await params;
  const adminClient = createSupabaseAdminClient();

  const { error } = await adminClient.from("tracks").delete().eq("id", trackId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
