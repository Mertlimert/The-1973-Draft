import type { Metadata } from "next";
import { Newsreader, Space_Mono } from "next/font/google";

import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "The 1973 Draft",
  description: "A generative anti-war farewell built for CSE 358.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${newsreader.variable} ${spaceMono.variable}`}>{children}</body>
    </html>
  );
}
