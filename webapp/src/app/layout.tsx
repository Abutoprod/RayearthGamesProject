import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rayearth Games",
  description: "Plataforma Rayearth Games",
  themeColor: "#0D0B11",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rayearth Games",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="animated-bg min-h-screen">{children}</body>
    </html>
  );
}
