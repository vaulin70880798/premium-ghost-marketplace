"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { DEMO_ADMIN_LOCAL_KEY } from "@/lib/auth/demo-admin";
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

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const storedFavorites = window.localStorage.getItem(FAVORITES_KEY);
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

    const hasDemoAdminSession = window.localStorage.getItem(DEMO_ADMIN_LOCAL_KEY) === "1";
    const storedRole = window.localStorage.getItem(ROLE_KEY) as UserRole | null;

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

    return window.localStorage.getItem(DEMO_ADMIN_LOCAL_KEY) === "1";
  });
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(() => !hasSupabaseEnv());

  const loadRoleFromProfile = useCallback(async (userId: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    if (data?.role) {
      setRole(parseRole(data.role));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(ROLE_KEY, role);
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
        window.localStorage.removeItem(DEMO_ADMIN_LOCAL_KEY);
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
        window.localStorage.setItem(DEMO_ADMIN_LOCAL_KEY, "1");
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
        window.localStorage.removeItem(DEMO_ADMIN_LOCAL_KEY);
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
