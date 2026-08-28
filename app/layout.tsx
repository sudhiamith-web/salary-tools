import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Salary-Tools — Salary, tax and HR calculators for India",
  description:
    "Free, accurate salary, tax and HR calculators built for Indian professionals. In-hand salary, HRA, PF, gratuity, TDS and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}
      >
        <header className="border-b border-ink/10 bg-paper">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-display text-xl text-ink">
              Salary-Tools<span className="text-ledger">.</span>
            </Link>
            <nav className="text-sm text-charcoal/70 flex gap-6">
              <SiteNav />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-ink/10 mt-24">
          <div className="mx-auto max-w-6xl px-6 py-10 text-xs text-charcoal/50">
            Salary-Tools is an independent project and is not affiliated with
            any employer, government body, or tax authority. Figures are
            estimates for planning purposes — always verify against your
            official payslip or a tax professional.
          </div>
        </footer>
      </body>
    </html>
  );
}
