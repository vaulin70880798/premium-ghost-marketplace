import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectToSignInWithError(origin: string, message: string) {
  const redirectUrl = new URL("/auth/sign-in", origin);
  redirectUrl.searchParams.set("oauth_error", message);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const oauthError = requestUrl.searchParams.get("error");
  const oauthErrorDescription = requestUrl.searchParams.get("error_description");
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (oauthError) {
    const message = oauthErrorDescription?.trim() || oauthError;
    return redirectToSignInWithError(requestUrl.origin, `Google sign-in failed: ${message}`);
  }

  if (!code) {
    return redirectToSignInWithError(requestUrl.origin, "Google sign-in failed: Missing authorization code.");
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        return redirectToSignInWithError(requestUrl.origin, `Google sign-in failed: ${exchangeError.message}`);
      }

      const user = data.user;

      if (user) {
        const displayName =
          (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()) ||
          (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
          (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
          "New Buyer";

        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email ?? null,
            display_name: displayName,
            role: "buyer",
            is_active: true,
          },
          { onConflict: "id" },
        );

        if (profileError) {
          console.error("Profile upsert failed after OAuth callback", profileError.message);
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected OAuth callback error.";
    return redirectToSignInWithError(requestUrl.origin, `Google sign-in failed: ${message}`);
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
