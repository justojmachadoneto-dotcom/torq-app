import type { Metadata } from "next";
import { Instrument_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TORQ",
  description: "Controle de manutencao veicular",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={instrumentSans.variable + " " + geistMono.variable + " antialiased"}>
        {children}
      </body>
    </html>
  );
}