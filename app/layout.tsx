import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "BlackSheep",
  description: "Sistema de gestión para BlackSheep CrossFit",
  manifest: "/manifest.json",
  icons: {
    apple: [
      { url: "/icons/BS-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: 'black',
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};


import PWAInitializer from "@/components/PWAInitializer";
import ReactQueryProvider from "@/lib/react-query/provider";
import RealtimeHandler from "@/components/RealtimeHandler";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-black`}>
        <ReactQueryProvider>
          <RealtimeHandler />
          <PWAInitializer />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
