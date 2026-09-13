import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NUSA LEARN — Belajar Jadi Petualangan",
  description:
    "Game edukasi futuristik untuk siswa SD. Asah numerik & literasi sambil menjelajah dunia NUSA!",
  keywords: [
    "NUSA LEARN",
    "game edukasi",
    "SD",
    "numerik",
    "literasi",
    "belajar sambil bermain",
    "PWA",
  ],
  authors: [{ name: "NUSA LEARN" }],
  manifest: "/manifest.json",
  applicationName: "NUSA LEARN",
  appleWebApp: {
    capable: true,
    title: "NUSA LEARN",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logo-nusa.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon-32.png", type: "image/png" }],
  },
  openGraph: {
    title: "NUSA LEARN — Belajar Jadi Petualangan",
    description:
      "Game edukasi futuristik untuk siswa SD. Asah numerik & literasi sambil menjelajah dunia NUSA!",
    type: "website",
    siteName: "NUSA LEARN",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "NUSA LEARN Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUSA LEARN",
    description:
      "Game edukasi futuristik untuk siswa SD — numerik & literasi sambil bermain!",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0EA5E9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* PWA: Mobile web app capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="NUSA LEARN" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="NUSA LEARN" />
        <meta name="msapplication-TileColor" content="#0EA5E9" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-256.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/logo-nusa.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
