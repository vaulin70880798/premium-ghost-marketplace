import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DEMO_ADMIN_SESSION_COOKIE } from "@/lib/auth/demo-admin";
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
  const cookieStore = await cookies();
  const hasDemoAdminSession = cookieStore.get(DEMO_ADMIN_SESSION_COOKIE)?.value === "1";

  if (hasDemoAdminSession) {
    return {
      isConfigured: true,
      user: { id: "demo-admin", email: "admin@ghostmarket.local" } as unknown as User,
      role: "admin",
      displayName: "Bootstrap Admin",
    };
  }

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

  if (!auth.user) {
    redirect(redirectPath);
  }

  return auth;
}

export async function requireRole(allowedRoles: UserRole[], fallbackPath = "/dashboard") {
  const auth = await requireSignedIn();

  if (!allowedRoles.includes(auth.role)) {
    redirect(fallbackPath);
  }

  return auth;
}
