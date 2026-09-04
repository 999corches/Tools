import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";

import { CommandPalette } from "@/components/layout/command-palette";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Bewusst ohne `title`: die Tool-Seiten sind Client-Komponenten und
// setzen ihren Titel über <title> im ToolShell (React hoistet das in
// den <head>). Ein Default hier würde ein zweites <title> erzeugen.
export const metadata: Metadata = {
  description:
    "Persönliche Sammlung kleiner Utility-Tools — clientseitig, ohne Konto und ohne Upload.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07090a" },
    { media: "(prefers-color-scheme: light)", color: "#f2f5f3" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="ambient" aria-hidden="true">
            <div className="grid-overlay" />
          </div>

          <CommandPalette>
            <Sidebar />
            <div className="lg:pl-64">
              <Header />
              <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
                {children}
              </main>
            </div>
          </CommandPalette>
        </ThemeProvider>
      </body>
    </html>
  );
}
