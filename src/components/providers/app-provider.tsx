"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { DEMO_ADMIN_LOCAL_KEY, DEMO_ADMIN_SESSION_COOKIE } from "@/lib/auth/demo-admin";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { UserRole } from "@/types/domain";

interface AppStateContextValue {
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  authEmail: string | null;
  authReady: boolean;
  syncRoleFromProfile: () => Promise<void>;
  activateDemoAdminSession: () => void;
  signOut: () => Promise<void>;
}

const FAVORITES_KEY = "ghost-market-favorites";
const ROLE_KEY = "ghost-market-role";

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

function parseRole(value: string | null | undefined): UserRole {
  if (value === "buyer" || value === "producer" || value === "admin") {
    return value;
  }

  return "buyer";
}

function hasDemoAdminCookieClient() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${DEMO_ADMIN_SESSION_COOKIE}=1`));
}

function safeStorageGet(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage write failures
  }
}

function safeStorageRemove(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage remove failures
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const storedFavorites = safeStorageGet(FAVORITES_KEY);
    if (!storedFavorites) {
      return [];
    }

    try {
      const parsed = JSON.parse(storedFavorites) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") {
      return "buyer";
    }

    const hasLocalDemoSession = safeStorageGet(DEMO_ADMIN_LOCAL_KEY) === "1";
    const hasCookieDemoSession = hasDemoAdminCookieClient();
    const hasDemoAdminSession = hasLocalDemoSession && hasCookieDemoSession;
    const storedRole = safeStorageGet(ROLE_KEY) as UserRole | null;

    if (hasLocalDemoSession && !hasCookieDemoSession) {
      safeStorageRemove(DEMO_ADMIN_LOCAL_KEY);
    }

    if (!hasDemoAdminSession && storedRole === "admin") {
      return "buyer";
    }

    if (storedRole === "buyer" || storedRole === "producer" || storedRole === "admin") {
      return storedRole;
    }

    return "buyer";
  });
  const [demoAdminSession, setDemoAdminSession] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const hasLocalDemoSession = safeStorageGet(DEMO_ADMIN_LOCAL_KEY) === "1";
    const hasCookieDemoSession = hasDemoAdminCookieClient();

    if (hasLocalDemoSession && !hasCookieDemoSession) {
      safeStorageRemove(DEMO_ADMIN_LOCAL_KEY);
      return false;
    }

    return hasLocalDemoSession && hasCookieDemoSession;
  });
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(() => !hasSupabaseEnv());

  const loadRoleFromProfile = useCallback(async (userId: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const { data } = await supabase.from("profiles").select("role, is_active").eq("id", userId).maybeSingle();

    if (data?.is_active === false) {
      await supabase.auth.signOut();
      setAuthUser(null);
      setRole("buyer");
      return;
    }

    if (data?.role) {
      setRole(parseRole(data.role));
    }
  }, []);

  useEffect(() => {
    safeStorageSet(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    safeStorageSet(ROLE_KEY, role);
  }, [role]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) {
        return;
      }

      setAuthUser(data.user ?? null);
      if (data.user) {
        await loadRoleFromProfile(data.user.id);
      }
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthUser(session?.user ?? null);

      if (session?.user) {
        setDemoAdminSession(false);
        safeStorageRemove(DEMO_ADMIN_LOCAL_KEY);
        await loadRoleFromProfile(session.user.id);
        return;
      }

      if (demoAdminSession) {
        return;
      }

      setRole("buyer");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [demoAdminSession, loadRoleFromProfile]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      favorites,
      toggleFavorite: (trackId: string) => {
        setFavorites((current) =>
          current.includes(trackId) ? current.filter((item) => item !== trackId) : [...current, trackId],
        );
      },
      isFavorite: (trackId: string) => favorites.includes(trackId),
      role,
      setRole,
      isAuthenticated: Boolean(authUser) || demoAdminSession,
      authEmail: authUser?.email ?? (demoAdminSession ? "admin@ghostmarket.local" : null),
      authReady,
      syncRoleFromProfile: async () => {
        if (!authUser || demoAdminSession) {
          return;
        }

        await loadRoleFromProfile(authUser.id);
      },
      activateDemoAdminSession: () => {
        safeStorageSet(DEMO_ADMIN_LOCAL_KEY, "1");
        setDemoAdminSession(true);
        setRole("admin");
        setAuthReady(true);
      },
      signOut: async () => {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
        await fetch("/api/auth/demo-admin-logout", { method: "POST" }).catch(() => undefined);
        safeStorageRemove(DEMO_ADMIN_LOCAL_KEY);
        setDemoAdminSession(false);
        setAuthUser(null);
        setRole("buyer");
      },
    }),
    [authReady, authUser, demoAdminSession, favorites, loadRoleFromProfile, role],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
