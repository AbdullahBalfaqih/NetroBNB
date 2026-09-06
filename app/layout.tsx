import type { Metadata } from "next";
import "./globals.css";
import { CryptoProvider } from "@/context/CryptoContext";
import { AppKitProvider } from "@/context/AppKit";

export const metadata: Metadata = {
  title: "NetroBNB - Asset Intelligence Dashboard",
  description: "AI-Powered Real-Time Asset Intelligence & Behavioral Telemetry Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F4F5F7] text-[#1C1C1C] font-sans">
        <AppKitProvider>
          <CryptoProvider>{children}</CryptoProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}

