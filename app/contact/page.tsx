import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Salary-Tools",
  description: "Get in touch with Salary-Tools.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl mb-8">Contact</h1>

      <div className="space-y-6 text-charcoal/80 text-[15px] leading-relaxed">
        <p>
          Questions, corrections, or suggestions for a new calculator —
          all welcome. Salary-Tools is maintained by one person, so
          replies may take a few days, but every message gets read.
        </p>

        <div className="card px-6 py-5 inline-block">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 font-medium mb-1">Email</p>
          <a href="mailto:hello@salary-tools.com" className="text-accent text-lg font-medium">
            hello@salary-tools.com
          </a>
        </div>

        <p>
          If you're reporting a calculation you believe is wrong, it
          helps to include the specific tool, the numbers you entered,
          and what you expected instead — that's the fastest way to get
          it checked and fixed.
        </p>
      </div>
    </div>
  );
}
