import type { Metadata } from "next";
import Link from "next/link";
import LwfMiniCalculator from "@/components/statutory/LwfMiniCalculator";
import { PageFaq, type FaqItem } from "@/components/statutory/PageFaq";

const PATH = "/tools/lwf-benefits";

export const metadata: Metadata = {
  title: "Labour Welfare Fund (LWF): Calculator and Benefits You Can Claim",
  description:
    "Work out your yearly Labour Welfare Fund deduction and learn what state welfare boards fund with it — and how to apply for the schemes.",
  alternates: { canonical: PATH },
};

const faqs: FaqItem[] = [
  {
    question: "What is the Labour Welfare Fund?",
    answer:
      "A small contribution, set by state law, paid by employees and employers to a state labour welfare board. The board uses it to run welfare schemes for workers and their families.",
  },
  {
    question: "Does every state have LWF?",
    answer:
      "No. Only some states levy it, and amounts, frequency and who is covered differ by state. Check your state's current rates on our LWF rates page.",
  },
  {
    question: "Do I get my LWF contribution back?",
    answer:
      "No. It isn't savings. In return you can apply for the welfare schemes your state board runs while you're contributing.",
  },
  {
    question: "How do I apply for an LWF scheme?",
    answer:
      "Visit your state labour welfare board's website or office. You'll usually need proof that LWF was deducted — a payslip or an employer certificate — plus documents for the specific scheme, such as a marksheet for a scholarship.",
  },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/tools" className="hover:underline">Tools</Link> /{" "}
        <span className="text-slate-800">LWF benefits</span>
      </nav>

      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">Labour Welfare Fund: what you pay and what you can claim</h1>
        <p className="text-slate-700">
          LWF is usually the smallest line on a payslip, and the one people know least about. The money funds state welfare
          schemes that you and your family can apply for.
        </p>
      </header>

      <LwfMiniCalculator />

      <section className="max-w-3xl space-y-3 leading-relaxed text-slate-800">
        <h2 className="text-2xl font-semibold text-slate-900">What LWF pays for</h2>
        <p>
          Each state's welfare board decides its own schemes, so what's on offer depends entirely on where you work. Boards
          commonly support things like education help for workers' children, medical assistance, help with family events
          such as weddings, funeral assistance, and recreation or skill-training facilities for workers.
        </p>
        <p>
          The schemes, amounts and eligibility rules change, so always check your state board before you apply. Our{" "}
          <Link href="/lwf-rates" className="underline underline-offset-2">
            state LWF pages
          </Link>{" "}
          list the current rates and link to each board.
        </p>

        <h2 className="pt-4 text-2xl font-semibold text-slate-900">How to use it</h2>
        <p>
          Keep your payslips: they're your proof of contribution. When a scheme fits — a child's admission, a medical bill, a
          family wedding — check the board's application window and documents list, apply with your employer's certificate
          if the board asks for one, and track the application with the board directly.
        </p>
        <p>
          LWF is one of the deductions that don't come back as money at retirement. See how it fits with PF, NPS and
          gratuity in the{" "}
          <Link href="/tools/retirement-benefits-calculator" className="underline underline-offset-2">
            retirement benefits calculator
          </Link>
          .
        </p>
      </section>

      <div className="max-w-3xl">
        <PageFaq items={faqs} />
      </div>
    </main>
  );
}
