import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Salary-Tools",
  description: "Why Salary-Tools exists and how it's built.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl mb-8">About Salary-Tools</h1>

      <div className="space-y-6 text-charcoal/80 text-[15px] leading-relaxed">
        <p>
          Salary-Tools is a free set of calculators built for Indian
          professionals trying to make sense of their salary, taxes, and
          statutory benefits — the kind of questions that come up when you
          get an offer letter, plan an investment, or try to understand
          why your take-home doesn't match your CTC.
        </p>
        <p>
          Every calculator computes entirely in your browser — nothing you
          enter is sent anywhere or stored. Each tool also includes a
          written explanation of the underlying rule and a set of common
          questions, so you're not just getting a number, but
          understanding where it comes from.
        </p>
        <p>
          Statutory figures (tax slabs, exemption limits, deduction caps)
          are checked against current government notifications and
          verified sources before being built into any calculator, and
          re-checked when rules change — like the Labour Codes update in
          November 2025, which changed real gratuity calculations.
        </p>
        <p>
          Salary-Tools is an independent project, not affiliated with any
          employer, government body, tax authority, or financial
          institution. It's built and maintained by one person, and it's
          not a substitute for advice from a qualified CA or tax
          professional — see our{" "}
          <Link href="/terms" className="text-accent underline">
            Terms
          </Link>{" "}
          for the full disclaimer.
        </p>
        <p>
          Have a suggestion for a calculator, or found something that
          looks wrong? Get in touch via the{" "}
          <Link href="/contact" className="text-accent underline">
            Contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
