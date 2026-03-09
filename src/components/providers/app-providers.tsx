"use client";

import { Toaster } from "sonner";

import { AppStateProvider } from "@/components/providers/app-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className: "!rounded-2xl !border-zinc-200 !bg-white !text-zinc-900 !shadow-[0_18px_60px_rgba(12,20,38,0.12)]",
        }}
      />
    </AppStateProvider>
  );
}
