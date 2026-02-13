import type { Metadata } from "next";
import { Montserrat_Alternates, Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const montserratAlternates = Montserrat_Alternates({
  variable: "--font-montserrat-alternates",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const sans = Montserrat_Alternates({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Benchmark Wallboard",
  description: "Wall-mounted benchmark dashboard for internal teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${montserratAlternates.variable} ${sans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
