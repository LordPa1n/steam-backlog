import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black font-sans text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}