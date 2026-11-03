// Small, dependency-free CSV helpers for the HR tools' bulk mode.
// Everything runs in the browser; nothing is uploaded.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Header row → lower-case snake keys; returns one object per data row. */
export function csvToObjects(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const all = parseCsv(text);
  if (!all.length) return { headers: [], rows: [] };
  const headers = all[0].map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
  const rows = all.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
  return { headers, rows };
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}

/** Parses "₹1,20,000", "120000", "1.2e5". Returns NaN when not a number. */
export function toNumber(raw: string | undefined): number {
  if (raw === undefined) return NaN;
  const s = raw.replace(/[₹,\s]/g, "");
  if (s === "") return NaN;
  return Number(s);
}

// Fields that must never appear in an uploaded file.
const PII_HINTS = ["name", "pan", "aadhaar", "aadhar", "uan", "bank", "account", "ifsc", "phone", "mobile", "email", "address", "dob", "date_of_birth"];

/** Column names that look like personal data, so the page can warn and ignore them. */
export function piiColumns(headers: string[]): string[] {
  return headers.filter((h) => h !== "employee_id" && PII_HINTS.some((p) => h === p || h.startsWith(p + "_") || h.endsWith("_" + p)));
}
