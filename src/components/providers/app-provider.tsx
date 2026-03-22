"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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

    const storedRole = window.localStorage.getItem(ROLE_KEY) as UserRole | null;
    if (storedRole === "buyer" || storedRole === "producer" || storedRole === "admin") {
      return storedRole;
    }

    return "buyer";
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
        await loadRoleFromProfile(session.user.id);
        return;
      }

      setRole("buyer");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadRoleFromProfile]);

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
      isAuthenticated: Boolean(authUser),
      authEmail: authUser?.email ?? null,
      authReady,
      syncRoleFromProfile: async () => {
        if (!authUser) {
          return;
        }

        await loadRoleFromProfile(authUser.id);
      },
      signOut: async () => {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
        setRole("buyer");
      },
    }),
    [authReady, authUser, favorites, loadRoleFromProfile, role],
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
