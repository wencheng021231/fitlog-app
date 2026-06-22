import type { Metadata, Viewport } from "next";
import { AppShell } from "@/features/fitness/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitLog",
  description: "记录训练计划、动作、组数、重量和历史趋势",
  applicationName: "FitLog",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "FitLog",
    statusBarStyle: "black-translucent",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/fitlog-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/fitlog-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0B0F14",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
