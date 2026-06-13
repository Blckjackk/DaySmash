import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DaySmash - Asisten Penjadwalan Badminton Mabar",
  description: "Aplikasi asisten penjadwalan ganda badminton komunitas mabar, offline ready.",
  manifest: "/manifest.json",
  icons: {
    icon: "/daysmash.webp",
    shortcut: "/daysmash.webp",
    apple: "/daysmash.webp",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DaySmash",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
