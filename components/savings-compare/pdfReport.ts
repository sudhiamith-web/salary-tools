// Builds the downloadable PDF report in the browser.
// jsPDF is loaded on demand from jsDelivr (pinned version), so no package.json change is needed.
// If the script can't load, we fall back to the browser's print dialog (Save as PDF).

import type { SavingsInputs, SavingsResult } from "@/lib/calculators/savingsCompare";
import { rupees, rupeesShort } from "./format";

const JSPDF_URL = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";

// Minimal typing for the parts of jsPDF we use.
interface PdfDoc {
  internal: { pageSize: { getWidth(): number; getHeight(): number } };
  setFont(family: string, style: string): void;
  setFontSize(size: number): void;
  setTextColor(r: number, g: number, b: number): void;
  setFillColor(r: number, g: number, b: number): void;
  setDrawColor(r: number, g: number, b: number): void;
  text(text: string | string[], x: number, y: number, opts?: { align?: "left" | "right" | "center" }): void;
  rect(x: number, y: number, w: number, h: number, style?: string): void;
  roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  splitTextToSize(text: string, width: number): string[];
  addPage(): void;
  setPage(n: number): void;
  getNumberOfPages(): number;
  save(filename: string): void;
}
type JsPdfCtor = new (opts: { unit: string; format: string }) => PdfDoc;

let loader: Promise<JsPdfCtor> | null = null;
function loadJsPdf(): Promise<JsPdfCtor> {
  const w = window as unknown as { jspdf?: { jsPDF: JsPdfCtor } };
  if (w.jspdf) return Promise.resolve(w.jspdf.jsPDF);
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = JSPDF_URL;
      s.async = true;
      s.onload = () => (w.jspdf ? resolve(w.jspdf.jsPDF) : reject(new Error("jsPDF missing")));
      s.onerror = () => {
        loader = null;
        reject(new Error("jsPDF failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}

// jsPDF's built-in fonts have no ₹ glyph.
const clean = (s: string) => s.replace(/₹/g, "Rs ").replace(/−/g, "-").replace(/–/g, "-");

const PDF_COLORS: Record<string, [number, number, number]> = {
  epfEmp: [51, 65, 85],
  epfEr: [100, 116, 139],
  vpf: [37, 99, 235],
  ppf: [217, 119, 6],
  npsOwn: [14, 116, 144],
  npsEmp: [6, 182, 212],
  mf: [219, 39, 119],
};

export async function downloadPdfReport(args: {
  inputs: SavingsInputs;
  result: SavingsResult;
  insight: string[];
  order: string[];
  todaysValue: boolean;
}): Promise<void> {
  let JsPDF: JsPdfCtor;
  try {
    JsPDF = await loadJsPdf();
  } catch {
    window.print();
    return;
  }
  const { inputs: st, result: R, insight, order, todaysValue } = args;
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 44;
  let y = M;
  const ink: [number, number, number] = [22, 33, 58];
  const muted: [number, number, number] = [90, 100, 120];
  const accent: [number, number, number] = [109, 40, 217];
  const line: [number, number, number] = [214, 220, 230];
  const f = (v: number) => rupeesShort(todaysValue ? v / R.deflator : v, "Rs ");
  const r = (v: number) => rupees(todaysValue ? v / R.deflator : v, "Rs ");

  const need = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const para = (txt: string, size: number, color: [number, number, number], bold = false, gap = 0) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(clean(txt), W - 2 * M);
    need(lines.length * size * 1.35);
    doc.text(lines, M, y + size);
    y += lines.length * size * 1.35 + gap;
  };

  doc.setFillColor(...accent);
  doc.rect(0, 0, W, 6, "F");
  para("Salary-Tools", 10, muted, true, 2);
  para(
    st.mode === "same" ? "EPF vs VPF vs PPF vs NPS vs Mutual Fund: after-tax comparison" : "Your retirement savings mix: after-tax projection",
    17,
    ink,
    true,
    4,
  );
  para(
    `Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}` +
      (todaysValue ? ` | Values in today's money (inflation ${st.inflation}%)` : " | Values in future rupees"),
    9,
    muted,
    false,
    12,
  );

  // Inputs box
  const rows: [string, string][] = [
    ["Age now / retire at", `${st.age} / ${st.retireAge} (${R.years} yrs)`],
    ["Tax regime / slab", `${st.regime === "new" ? "New" : "Old"} / ${st.slab}% + cess`],
    ["Basic salary / month", rupees(st.basicMonthly, "Rs ")],
    ["EPF you / employer", `${rupees(st.epfEmpMonthly, "Rs ")} / ${rupees(st.epfErMonthly, "Rs ")}`],
    [st.mode === "same" ? "Amount compared / month" : "Mode", st.mode === "same" ? `${rupees(st.amountMonthly, "Rs ")} of gross salary` : "Your own mix"],
    ["Yearly raise / inflation", `${st.stepUp}% / ${st.inflation}%`],
    ["Returns EPF / PPF", `${st.rEpf}% / ${st.rPpf}%`],
    ["Returns NPS / MF (assumed)", `${st.rNps}% / ${st.rMf}%`],
  ];
  const boxH = Math.ceil(rows.length / 2) * 18 + 16;
  need(boxH);
  doc.setDrawColor(...line);
  doc.setFillColor(246, 248, 251);
  doc.roundedRect(M, y, W - 2 * M, boxH, 6, 6, "FD");
  rows.forEach(([k, v], i) => {
    const cx = M + 12 + (i % 2) * ((W - 2 * M) / 2);
    const cy = y + 20 + Math.floor(i / 2) * 18;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text(k, cx, cy);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ink);
    doc.text(clean(v), cx + 118, cy);
  });
  y += boxH + 16;

  para("Key takeaway", 12, ink, true, 2);
  insight.forEach((t) => para(t, 10, ink, false, 3));
  y += 6;
  if (st.mode === "same")
    para(`Your existing EPF alone grows to ${f(R.baseline.value)} at ${st.retireAge}, tax-free. The options below are on top of it.`, 9.5, muted, false, 10);

  // After-tax bars
  para(`After-tax amount in hand at ${st.retireAge}`, 12, ink, true, 6);
  const max = Math.max(1, ...R.routes.map((x) => x.exit.post));
  const lw = 130;
  const bw = W - 2 * M - lw - 90;
  R.routes.forEach((x) => {
    need(22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...ink);
    doc.text(clean(x.name), M, y + 11);
    doc.setFillColor(238, 241, 245);
    doc.rect(M + lw, y + 2, bw, 12, "F");
    doc.setFillColor(...(PDF_COLORS[x.key] ?? accent));
    doc.rect(M + lw, y + 2, Math.max(1, (bw * x.exit.post) / max), 12, "F");
    doc.setFont("helvetica", "bold");
    doc.text(f(x.exit.post), W - M, y + 11, { align: "right" });
    y += 20;
  });
  y += 10;

  // Details table
  const cols = ["Option", st.mode === "same" ? "Starts /mo" : "Year-1 /mo", "Put in", "Value", "Exit tax", "In hand", "Pension /mo"];
  const cw = [118, 62, 62, 62, 58, 64, 61];
  const drawRow = (cells: string[], bold: boolean, fill?: [number, number, number]) => {
    need(20);
    if (fill) {
      doc.setFillColor(...fill);
      doc.rect(M, y, W - 2 * M, 18, "F");
    }
    let x = M;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(8.6);
    doc.setTextColor(...ink);
    cells.forEach((c, i) => {
      if (i === 0) doc.text(clean(c), x + 4, y + 12);
      else doc.text(clean(c), x + cw[i] - 4, y + 12, { align: "right" });
      x += cw[i];
    });
    doc.setDrawColor(...line);
    doc.line(M, y + 18, W - M, y + 18);
    y += 18;
  };
  para("Details", 12, ink, true, 6);
  drawRow(cols, true, [238, 241, 245]);
  R.routes.forEach((x) =>
    drawRow(
      [x.name, rupees(x.firstMonth, "Rs "), f(x.invested), f(x.value), x.exit.exitTax > 0 ? f(x.exit.exitTax) : "None", f(x.exit.post), x.exit.pension ? r(x.exit.pension) : "-"],
      false,
    ),
  );
  if (st.mode === "mix") {
    const s = (fn: (x: (typeof R.routes)[number]) => number) => R.routes.reduce((a, x) => a + fn(x), 0);
    drawRow(
      ["Total", rupees(s((x) => x.firstMonth), "Rs "), f(s((x) => x.invested)), f(s((x) => x.value)), f(s((x) => x.exit.exitTax)), f(s((x) => x.exit.post)), ""],
      true,
      [237, 233, 254],
    );
  }
  y += 12;

  if (R.warnings.length) {
    para("Things to watch", 12, ink, true, 4);
    R.warnings.forEach((w) => para(`- ${w}`, 9.5, ink, false, 3));
    y += 8;
  }
  para("Smart order to fill (tax efficiency only)", 12, ink, true, 4);
  order.forEach((o, i) => para(`${i + 1}. ${o}`, 9.5, ink, false, 3));
  para("This order looks only at tax. Your goals, time horizon and need for cash matter just as much.", 9, muted, false, 8);

  para("Assumptions", 12, ink, true, 4);
  [
    "EPF/VPF 8.25%: FY 2025-26 rate ratified by the government. PPF 7.1%: October-December 2026 rate (Ministry of Finance), reviewed quarterly.",
    "NPS and mutual fund returns are assumptions, not guarantees. Contributions and basic salary grow by the yearly raise you set.",
    "NPS: 60% of the corpus is tax-free; any extra lump sum and the annuity are taxed at your post-retirement slab. Retiring before 60 is treated as an early exit (20% lump sum).",
    "Mutual funds: equity gains above Rs 1.25 lakh taxed at 12.5% + cess, as if sold at retirement. EPF: tax-free withdrawal assumes 5+ years of continuous service.",
    "Employer contributions to EPF + NPS + superannuation are tax-free only up to Rs 7.5 lakh a year. Surcharge is not included.",
  ].forEach((a) => para(`- ${a}`, 9, muted, false, 2));
  y += 8;
  para(
    "Not financial or tax advice. This is an estimate based on rules as of November 2026. Tax laws change; check with a qualified tax advisor before you decide.",
    9,
    ink,
    true,
  );

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`salary-tools.com  |  Page ${i} of ${pages}`, W / 2, H - 20, { align: "center" });
  }
  doc.save("salary-tools-savings-comparison.pdf");
}
