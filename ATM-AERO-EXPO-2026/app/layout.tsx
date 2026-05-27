import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import OfflineBanner from "./components/OfflineBanner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AERO EXPO 2026 – Interní briefing | AIR TEAM",
  description: "Interní briefing AIR TEAM pro veletrh AERO EXPO 2026, Friedrichshafen, 22.–25. 4. 2026",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AERO EXPO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" style={{ height: "100%" }} className={poppins.variable}>
      <body style={{ height: "100%", margin: 0, padding: 0 }}>
        <SessionProvider>
          {children}
          <OfflineBanner />
        </SessionProvider>
      </body>
    </html>
  );
}
