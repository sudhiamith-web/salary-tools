import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Salary-Tools",
  description: "How Salary-Tools handles your data and cookies.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl mb-2">Privacy Policy</h1>
      <p className="text-charcoal/50 text-sm mb-10">Last updated: September 2026</p>

      <div className="space-y-8 text-charcoal/80 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl text-ink mb-2">What this site does with your calculator inputs</h2>
          <p>
            All calculations on Salary-Tools happen entirely in your browser.
            Numbers you enter into a calculator — your salary, rent, tax
            details, or anything else — are never sent to our servers,
            never stored, and never seen by us. Closing or refreshing the
            page clears everything you entered.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">Cookies and analytics</h2>
          <p>
            With your consent (via the cookie banner shown on your first
            visit), we use Google Analytics to understand aggregate,
            anonymized site usage — which pages get visited, roughly how
            many people use each calculator, and general traffic trends.
            This helps us decide which tools to build next. Google
            Analytics may set cookies to distinguish visitors; see{" "}
            <a
              href="https://policies.google.com/privacy"
              className="text-accent underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google's Privacy Policy
            </a>{" "}
            for how Google handles that data.
          </p>
          <p>
            You can decline analytics cookies from the banner, or clear your
            choice at any time by clearing your browser's local storage for
            this site. Declining doesn't limit any calculator's functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">Advertising</h2>
          <p>
            Salary-Tools does not currently display advertising. If that
            changes in the future, this page will be updated in advance to
            describe what ad providers are used and what data they collect,
            and the cookie banner will be updated to reflect it.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">Third-party services</h2>
          <p>
            This site is hosted on Netlify and uses Google Analytics as
            described above. Neither service receives your calculator
            inputs — only standard web analytics data (pages visited,
            approximate location by IP, device/browser type).
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">Accuracy disclaimer</h2>
          <p>
            Salary-Tools provides estimates for planning purposes only. We
            are not a tax advisory, financial advisory, or legal service.
            Figures should be verified against your official payslip,
            Form 16, or a qualified tax professional before you rely on
            them for filing or financial decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-ink mb-2">Contact</h2>
          <p>
            Questions about this policy or how the site handles data can be
            sent to the contact details listed on our homepage or footer.
          </p>
        </section>
      </div>
    </div>
  );
}
