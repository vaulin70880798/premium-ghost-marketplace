"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { UserRole } from "@/types/domain";

interface AppStateContextValue {
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const FAVORITES_KEY = "ghost-market-favorites";
const ROLE_KEY = "ghost-market-role";

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

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

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(ROLE_KEY, role);
  }, [role]);

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
    }),
    [favorites, role],
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
