"use client";

// Shared bulk (CSV) mode for the HR tools. The file is read with the browser's
// File API and calculated on the device; nothing is uploaded or stored.

import { useState, type ReactNode } from "react";
import { csvToObjects, piiColumns, toCsv } from "@/lib/hr/csv";
import { downloadCsv } from "./download";
import { downloadPdf } from "./pdf";
import { ActionButton, Card, Pill, PiiNotice } from "./ui";

export interface BulkColumn<R> {
  label: string;
  value: (r: R) => string;
  align?: "left" | "right";
  tone?: (r: R) => "gain" | "loss" | undefined;
}

interface Props<T, R extends { id: string }> {
  toolName: string;
  fileStem: string;
  headers: string[];
  required: string[];
  sample: string[][];
  needs: string;
  columnHelp: ReactNode;
  parse: (row: Record<string, string>) => T | string;
  compute: (items: { id: string; value: T }[]) => R[];
  columns: BulkColumn<R>[];
  summary?: (results: R[]) => ReactNode;
  pdfSummary?: (results: R[]) => [string, string][];
  rowStatus?: (r: R) => { tone: "ok" | "bad" | "warn" | "info"; label: string } | undefined;
}

const MAX_ROWS = 5000;
const SHOW_ROWS = 100;

export default function BulkPanel<T, R extends { id: string }>(p: Props<T, R>) {
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState<{ row: number; msg: string }[]>([]);
  const [ignored, setIgnored] = useState<string[]>([]);
  const [items, setItems] = useState<{ id: string; value: T }[]>([]);
  // Recalculated on every render, so changing a setting on the page updates the results at once.
  const results = p.compute(items);
  const [fatal, setFatal] = useState("");
  const [rowsRead, setRowsRead] = useState(0);

  const reset = () => {
    setErrors([]);
    setIgnored([]);
    setItems([]);
    setFatal("");
    setRowsRead(0);
  };

  const onFile = async (file: File | undefined) => {
    reset();
    if (!file) return;
    setFileName(file.name);
    if (!/\.csv$/i.test(file.name)) {
      setFatal("Upload a .csv file. In Excel, use File › Save As › CSV (UTF-8).");
      return;
    }
    const { headers, rows } = csvToObjects(await file.text());
    const missing = p.required.filter((h) => !headers.includes(h));
    if (missing.length) {
      setFatal(`These columns are missing: ${missing.join(", ")}. Download the template to see the expected columns.`);
      return;
    }
    if (rows.length > MAX_ROWS) {
      setFatal(`The file has ${rows.length.toLocaleString("en-IN")} rows. Split it into files of up to ${MAX_ROWS.toLocaleString("en-IN")} rows.`);
      return;
    }
    setIgnored(piiColumns(headers));
    setRowsRead(rows.length);
    const errs: { row: number; msg: string }[] = [];
    const ok: { id: string; value: T }[] = [];
    rows.forEach((row, i) => {
      const line = i + 2; // header is line 1
      const id = row.employee_id;
      if (!id) {
        errs.push({ row: line, msg: "employee_id is empty" });
        return;
      }
      const v = p.parse(row);
      if (typeof v === "string") errs.push({ row: line, msg: v });
      else ok.push({ id, value: v });
    });
    setErrors(errs);
    setItems(ok);
  };

  const exportCsv = () =>
    downloadCsv(
      `${p.fileStem}-results.csv`,
      toCsv(
        p.columns.map((c) => c.label),
        results.map((r) => p.columns.map((c) => c.value(r))),
      ),
    );

  const exportPdf = () =>
    downloadPdf({
      title: `${p.toolName} – bulk results`,
      subtitle: fileName,
      summary: [["Rows read", String(rowsRead)], ["Calculated", String(results.length)], ["Rows to fix", String(errors.length)], ...(p.pdfSummary?.(results) ?? [])],
      table: {
        columns: p.columns.map((c) => c.label),
        rows: results.map((r) => p.columns.map((c) => c.value(r))),
        align: p.columns.map((c, i) => c.align ?? (i === 0 ? "left" : "right")),
      },
      notes: errors.slice(0, 20).map((e) => `Row ${e.row}: ${e.msg}`),
      filename: `${p.fileStem}-results.pdf`,
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <h3 className="mb-2 font-display text-lg text-ink">1. Get the template</h3>
          <div className="mb-4 text-sm text-charcoal/70">{p.columnHelp}</div>
          <ActionButton onClick={() => downloadCsv(`${p.fileStem}-template.csv`, toCsv(p.headers, p.sample))}>Download CSV template</ActionButton>
        </Card>
        <Card>
          <h3 className="mb-2 font-display text-lg text-ink">2. Upload your file</h3>
          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-accent">
            <span className="block font-semibold text-ink">Choose a CSV file</span>
            <span className="text-xs text-charcoal/60">Up to {MAX_ROWS.toLocaleString("en-IN")} rows</span>
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {fileName && <p className="mt-2 truncate text-xs text-charcoal/60">{fileName}</p>}
        </Card>
        <div className="space-y-3">
          <PiiNotice needs={p.needs} />
        </div>
      </div>

      {fatal && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{fatal}</p>}

      {ignored.length > 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your file has columns that look like personal data ({ignored.join(", ")}). They were ignored. Remove them from your file before sharing it
          anywhere.
        </p>
      )}

      {(results.length > 0 || errors.length > 0) && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl text-ink">3. Results</h3>
            <div className="flex flex-wrap gap-2">
              <ActionButton primary onClick={exportCsv}>
                Export to Excel (CSV)
              </ActionButton>
              <ActionButton onClick={exportPdf}>Download PDF</ActionButton>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Pill tone="info">{rowsRead} rows read</Pill>
            <Pill tone="ok">{results.length} calculated</Pill>
            {errors.length > 0 && <Pill tone="warn">{errors.length} rows need fixing</Pill>}
          </div>
          {p.summary && <div className="mb-4">{p.summary(results)}</div>}
          {errors.length > 0 && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="mb-1 font-semibold">Fix these rows in your file and upload it again. The other rows are already calculated.</p>
              <ul className="list-disc pl-5">
                {errors.slice(0, 10).map((e) => (
                  <li key={e.row}>
                    Row {e.row}: {e.msg}
                  </li>
                ))}
              </ul>
              {errors.length > 10 && <p className="mt-1">…and {errors.length - 10} more. The PDF lists the first 20.</p>}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-charcoal/60">
                  {p.columns.map((c, i) => (
                    <th key={c.label} className={`px-2 py-2 font-semibold ${(c.align ?? (i === 0 ? "left" : "right")) === "right" ? "text-right" : ""}`}>
                      {c.label}
                    </th>
                  ))}
                  {p.rowStatus && <th className="px-2 py-2 font-semibold">Status</th>}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, SHOW_ROWS).map((r) => {
                  const st = p.rowStatus?.(r);
                  return (
                    <tr key={r.id} className="border-b border-slate-100">
                      {p.columns.map((c, i) => {
                        const tone = c.tone?.(r);
                        return (
                          <td
                            key={c.label}
                            className={`px-2 py-2 tabular-nums ${(c.align ?? (i === 0 ? "left" : "right")) === "right" ? "text-right" : ""} ${tone === "gain" ? "text-ledger" : tone === "loss" ? "text-rust" : "text-ink"}`}
                          >
                            {c.value(r)}
                          </td>
                        );
                      })}
                      {p.rowStatus && <td className="px-2 py-2">{st && <Pill tone={st.tone}>{st.label}</Pill>}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {results.length > SHOW_ROWS && (
            <p className="mt-2 text-xs text-charcoal/60">
              Showing {SHOW_ROWS} of {results.length}. The export includes every row.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
