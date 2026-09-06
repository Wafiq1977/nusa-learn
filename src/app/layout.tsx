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
  description: "Game edukasi futuristik untuk siswa SD. Asah numerik & literasi sambil menjelajah dunia NUSA!",
  keywords: ["NUSA LEARN", "game edukasi", "SD", "numerik", "literasi", "belajar sambil bermain"],
  authors: [{ name: "NUSA LEARN" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: undefined,
  openGraph: {
    title: "NUSA LEARN — Belajar Jadi Petualangan",
    description: "Game edukasi futuristik untuk siswa SD. Asah numerik & literasi sambil menjelajah dunia NUSA!",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0EA5E9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
