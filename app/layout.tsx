import type { Metadata, Viewport } from "next";
import { Archivo, Newsreader, JetBrains_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

// Archivo is variable on both weight and width — the hero is built on those two axes.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-serif", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Rohith B M — Software Developer",
  description:
    "Full-stack software developer in Bengaluru, frontend first. Realtime interfaces, async backends and AI tooling — currently at Flatworld AI.",
  openGraph: {
    title: "Rohith B M — Software Developer",
    description: "Full-stack, frontend first. Realtime interfaces, async backends and AI tooling.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ECE9E2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `js` is added before paint so pre-animation states only apply when scripts run.
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip" href="#work">
          Skip to work
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
