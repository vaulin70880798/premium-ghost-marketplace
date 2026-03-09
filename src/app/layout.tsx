import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";

import { SiteLayout } from "@/components/layout/site-layout";
import { AppProviders } from "@/components/providers/app-providers";
import { defaultSeo } from "@/lib/constants";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: defaultSeo.title,
  description: defaultSeo.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable} antialiased`}>
        <AppProviders>
          <SiteLayout>{children}</SiteLayout>
        </AppProviders>
      </body>
    </html>
  );
}
