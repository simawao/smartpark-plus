import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KO-PARK | Kocaeli Akıllı Park Sistemi",
  description: "Kocaeli parkları ve millet bahçeleri için akıllı bakım, görev ve karar destek platformu.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="tr"><body className={manrope.variable}>{children}</body></html>;
}
