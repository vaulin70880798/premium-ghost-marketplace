"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAppState } from "@/components/providers/app-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { navigationItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { favorites, role, isAuthenticated, signOut, authEmail } = useAppState();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold tracking-widest text-white">
            GM
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-950">Ghost Market</p>
            <p className="text-[11px] text-zinc-500">Exclusive Music Rights</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900",
                  isActive && "bg-zinc-100 text-zinc-950",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/favorites" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}>
            <Heart className="h-4 w-4" />
            <span>{favorites.length}</span>
          </Link>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
            {role === "buyer" ? "Buyer Dashboard" : role === "producer" ? "Producer Dashboard" : "Admin Dashboard"}
          </Link>
          {isAuthenticated ? (
            <Button
              variant="default"
              size="sm"
              onClick={async () => {
                await signOut();
                toast.success("Signed out");
                router.push("/");
                router.refresh();
              }}
              className="gap-1"
              title={authEmail ?? undefined}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Link href="/auth/sign-in" className={buttonVariants({ variant: "default", size: "sm" })}>
              Sign In
            </Link>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-200 bg-white px-4 py-4 md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800"
              >
                Dashboard
              </Link>
              <Link
                href="/auth/sign-in"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white"
              >
                {isAuthenticated ? "Account" : "Sign In"}
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
