import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase.auth.exchangeCodeForSession(code);
      const user = data.user;

      if (user) {
        const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

        if (!existingProfile) {
          const displayName =
            (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()) ||
            (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
            (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
            "New Buyer";

          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email ?? null,
            display_name: displayName,
            role: "buyer",
            is_active: true,
          });
        }
      }
    }
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
