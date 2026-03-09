import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SUPPORTED_LOCALES } from "@/lib/types";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(({ code }) => ({ locale: code }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function ContentLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5">
              <Link
                href="/"
                className="text-sm font-semibold text-text-primary transition-colors hover:text-accent"
              >
                Expo Playground
              </Link>
              <ThemeToggle />
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
