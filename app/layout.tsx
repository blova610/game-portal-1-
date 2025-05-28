import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getAllHomepageConfig } from "@/lib/game-utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const RawHTML = ({ html }: { html: string }) => {
  return <>{html}</>;
};

export async function generateMetadata(): Promise<Metadata> {
  const homepageConfig = await getAllHomepageConfig();

  return {
    title: homepageConfig.site_title || "Modern Web Game Portal",
    description:
      homepageConfig.site_description ||
      "Play the best online games for free on our modern web game portal.",
    keywords:
      homepageConfig.site_keywords ||
      "web games, online games, free games, browser games",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const homepageConfig = await getAllHomepageConfig();
  const headerScript = homepageConfig.custom_header_script?.trim() || null;
  const bodyScript = homepageConfig.custom_botton_body_script?.trim() || null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>{headerScript && <RawHTML html={headerScript} />}</head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
            </div>
            <Toaster />
            {bodyScript && <RawHTML html={bodyScript} />}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
