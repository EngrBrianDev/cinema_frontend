import type { Metadata } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const vietnam = Be_Vietnam_Pro({
  variable: "--font-vietnam",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DA REUNION",
  description: "Cinema booking and ticket management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${space.variable} ${vietnam.variable}`}>
      <body className="min-h-screen bg-background text-on-background font-body-md">{children}</body>
    </html>
  );
}
