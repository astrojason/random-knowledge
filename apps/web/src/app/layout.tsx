import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { Footer } from "@/components/Footer";
import "./globals.css";

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
  applicationName: "Random Knowledge",
  appleWebApp: {
    capable: true,
    title: "Random Knowledge",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9e1cc" },
    { media: "(prefers-color-scheme: dark)", color: "#141b22" },
  ],
};

// Every page here is a per-signed-in-user view driven by client-side Firebase
// Auth + Firestore reads — never statically prerenderable.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} h-full`}>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-fg antialiased">
        <div className="flex-1">
          <AuthProvider>{children}</AuthProvider>
        </div>
        <Footer />
      </body>
    </html>
  );
}
