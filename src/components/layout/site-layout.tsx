import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(99,102,241,0.12),transparent_38%),radial-gradient(circle_at_85%_12%,rgba(161,161,170,0.14),transparent_32%)]" />
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</main>
      <Footer />
    </div>
  );
}
