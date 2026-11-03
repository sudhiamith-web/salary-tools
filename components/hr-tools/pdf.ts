// Generic PDF report for the HR tools: title, key-value summary, an optional
// table and notes. jsPDF 2.5.1 loads from jsDelivr only when someone clicks
// Download PDF; if it can't load, the browser's print dialog opens instead.

const JSPDF_URL = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";

interface PdfDoc {
  internal: { pageSize: { getWidth(): number; getHeight(): number } };
  setFont(f: string, s: string): void;
  setFontSize(n: number): void;
  setTextColor(r: number, g: number, b: number): void;
  setFillColor(r: number, g: number, b: number): void;
  setDrawColor(r: number, g: number, b: number): void;
  text(t: string | string[], x: number, y: number, o?: { align?: "left" | "right" | "center" }): void;
  rect(x: number, y: number, w: number, h: number, s?: string): void;
  line(a: number, b: number, c: number, d: number): void;
  splitTextToSize(t: string, w: number): string[];
  addPage(): void;
  setPage(n: number): void;
  getNumberOfPages(): number;
  save(name: string): void;
}
type Ctor = new (o: { unit: string; format: string; orientation?: string }) => PdfDoc;

let loader: Promise<Ctor> | null = null;
function loadJsPdf(): Promise<Ctor> {
  const w = window as unknown as { jspdf?: { jsPDF: Ctor } };
  if (w.jspdf) return Promise.resolve(w.jspdf.jsPDF);
  if (!loader)
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
  return loader;
}

// The built-in PDF fonts have no ₹ glyph.
const clean = (s: string) => String(s).replace(/₹/g, "Rs ").replace(/[−–]/g, "-").replace(/[“”]/g, '"').replace(/’/g, "'");

export interface PdfReport {
  title: string;
  subtitle?: string;
  summary: [string, string][];
  table?: { columns: string[]; rows: string[][]; align?: ("left" | "right")[] };
  notes?: string[];
  filename: string;
}

export async function downloadPdf(r: PdfReport): Promise<void> {
  let JsPDF: Ctor;
  try {
    JsPDF = await loadJsPdf();
  } catch {
    window.print();
    return;
  }
  const wide = (r.table?.columns.length ?? 0) > 7;
  const doc = new JsPDF({ unit: "pt", format: "a4", orientation: wide ? "landscape" : "portrait" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  let y = M;
  const ink: [number, number, number] = [15, 23, 42];
  const muted: [number, number, number] = [71, 85, 105];
  const line: [number, number, number] = [226, 232, 240];
  const need = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const para = (t: string, size: number, color: [number, number, number], bold = false, gap = 0) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(clean(t), W - 2 * M);
    need(lines.length * size * 1.35);
    doc.text(lines, M, y + size);
    y += lines.length * size * 1.35 + gap;
  };

  doc.setFillColor(109, 40, 217);
  doc.rect(0, 0, W, 6, "F");
  para("Salary-Tools", 10, muted, true, 2);
  para(r.title, 16, ink, true, 2);
  para(
    (r.subtitle ? r.subtitle + " | " : "") + `Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    9,
    muted,
    false,
    12,
  );

  for (const [k, v] of r.summary) {
    need(18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text(clean(k), M, y + 11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ink);
    doc.text(clean(v), W - M, y + 11, { align: "right" });
    doc.setDrawColor(...line);
    doc.line(M, y + 16, W - M, y + 16);
    y += 18;
  }
  y += 12;

  if (r.table && r.table.rows.length) {
    const cols = r.table.columns;
    const cw = (W - 2 * M) / cols.length;
    const row = (cells: string[], bold: boolean, fill?: [number, number, number]) => {
      need(18);
      if (fill) {
        doc.setFillColor(...fill);
        doc.rect(M, y, W - 2 * M, 17, "F");
      }
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(8);
      doc.setTextColor(...ink);
      cells.forEach((c, i) => {
        const right = (r.table!.align?.[i] ?? (i === 0 ? "left" : "right")) === "right";
        const txt = doc.splitTextToSize(clean(c), cw - 6)[0] ?? "";
        doc.text(txt, right ? M + cw * (i + 1) - 3 : M + cw * i + 3, y + 11, { align: right ? "right" : "left" });
      });
      doc.setDrawColor(...line);
      doc.line(M, y + 17, W - M, y + 17);
      y += 17;
    };
    row(cols, true, [241, 245, 249]);
    r.table.rows.forEach((cells) => row(cells, false));
    y += 12;
  }

  if (r.notes?.length) {
    para("Notes", 11, ink, true, 4);
    r.notes.forEach((n) => para("- " + n, 8.5, muted, false, 2));
  }
  y += 6;
  para(
    "Estimate based on rules as of November 2026 and the inputs given. Not legal, tax or payroll advice. Check source notifications and company policy before acting.",
    8.5,
    ink,
    true,
  );

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`salary-tools.com  |  Page ${i} of ${pages}`, W / 2, H - 18, { align: "center" });
  }
  doc.save(r.filename);
}
