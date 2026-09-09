import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { STORAGE_KEY, THEME_VALUES } from "@/lib/theme";
import "./globals.css";

const THEME_INIT_SCRIPT = `
  try {
    var t = window.localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    if (${JSON.stringify(THEME_VALUES)}.indexOf(t) !== -1) document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Random Knowledge",
  description: "One short lesson a day, with a quick comprehension check.",
};

// Every page here is a per-signed-in-user view driven by client-side Firebase
// Auth + Firestore reads — never statically prerenderable.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} h-full`}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-full bg-bg font-sans text-fg antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
