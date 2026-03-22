import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { UserRole } from "@/types/domain";

export interface AuthState {
  isConfigured: boolean;
  user: User | null;
  role: UserRole;
  displayName: string | null;
}

function parseRole(value: string | null | undefined): UserRole {
  if (value === "buyer" || value === "producer" || value === "admin") {
    return value;
  }

  return "buyer";
}

export async function getAuthState(): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return {
      isConfigured: false,
      user: null,
      role: "buyer",
      displayName: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      isConfigured: false,
      user: null,
      role: "buyer",
      displayName: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isConfigured: true,
      user: null,
      role: "buyer",
      displayName: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    isConfigured: true,
    user,
    role: parseRole(profile?.role),
    displayName: profile?.display_name ?? null,
  };
}

export async function requireSignedIn(redirectPath = "/auth/sign-in") {
  const auth = await getAuthState();

  if (auth.isConfigured && !auth.user) {
    redirect(redirectPath);
  }

  return auth;
}

export async function requireRole(allowedRoles: UserRole[], fallbackPath = "/dashboard") {
  const auth = await requireSignedIn();

  if (auth.isConfigured && auth.user && !allowedRoles.includes(auth.role)) {
    redirect(fallbackPath);
  }

  return auth;
}
