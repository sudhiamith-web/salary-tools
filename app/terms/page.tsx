import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Salary-Tools",
  description: "Terms of use and disclaimer for Salary-Tools.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl mb-2">Terms & Conditions</h1>
      <p className="text-charcoal/50 text-sm mb-10">Last updated: September 2026</p>

      <div className="space-y-8 text-charcoal/80 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl text-ink mb-2">Estimates, not advice</h2>
          <p>
            Every calculator on Salary-Tools produces an estimate for
            general planning purposes. It is not tax advice, financial
            advice, legal advice, or a substitute for a qualified
            Chartered Accountant, tax professional, or financial advisor.
            Figures should be verified against your official payslip,
            Form 16, or a professional before you rely on them for actual
            filing, financial decisions, or legal compliance.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">No guarantee of accuracy</h2>
          <p>
            We make a genuine effort to keep statutory figures (tax
            slabs, exemption limits, deduction caps, and similar rules)
            current and correct, and we verify them against official
            sources before publishing. Tax law changes, sometimes with
            limited notice, and errors are possible despite our efforts.
            Salary-Tools and its operator are not liable for any loss,
            penalty, or damage arising from reliance on any calculation,
            figure, or explanation on this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">No affiliation</h2>
          <p>
            Salary-Tools is an independent project. It is not affiliated
            with, endorsed by, or connected to any employer, government
            body, the Income Tax Department, or any financial
            institution referenced on this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">Acceptable use</h2>
          <p>
            You're welcome to use Salary-Tools for personal or
            professional reference. Automated scraping or bulk
            reproduction of the site's content or tools without
            permission isn't permitted.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">Changes to these terms</h2>
          <p>
            These terms may be updated as the site grows — for example,
            if advertising or new features are added. Material changes
            will be reflected here with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">Contact</h2>
          <p>
            Questions about these terms can be sent via the{" "}
            <a href="/contact" className="text-accent underline">
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
