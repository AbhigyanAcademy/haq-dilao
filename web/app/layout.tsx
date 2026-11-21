import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Figtree, Noto_Sans_Bengali, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Haq Dilao — Know what you can claim",
  description: "Discover government schemes you are eligible for. Register once, see only your schemes, prepare applications, track them, and get notified of new schemes and deadlines.",
};

export const viewport: Viewport = {
  themeColor: "#06070A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${figtree.variable} ${notoSansBengali.variable} ${notoSansDevanagari.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--obsidian)] text-[var(--text-1)] font-[var(--font-figtree)]">
        {children}
      </body>
    </html>
  );
}