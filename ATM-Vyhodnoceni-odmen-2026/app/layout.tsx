import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vyhodnocení odměn – AIR TEAM",
  description: "Interní nástroj pro vyhodnocení odměn z eventů AIR TEAM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={poppins.variable}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
