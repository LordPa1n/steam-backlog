import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Steam Oracle",
  description:
    "Discover your gaming identity, achievements, playstyle and backlog insights.",
  keywords: [
    "Steam",
    "Steam Analytics",
    "Steam Backlog",
    "Steam Profile Analyzer",
    "Gaming Statistics",
    "Steam AI",
  ],
  authors: [
    {
      name: "Steam Oracle",
    },
  ],
  openGraph: {
    title: "Steam Oracle",
    description:
      "Discover your gaming identity, achievements, playstyle and backlog insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}