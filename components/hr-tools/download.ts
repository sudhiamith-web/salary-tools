// Saves a file the browser generated. Nothing leaves the device.
// bom: add a UTF-8 byte-order mark so Excel reads ₹ and accents in CSVs correctly.
export function downloadFile(filename: string, data: string | Blob, mime = "text/plain;charset=utf-8", bom = false) {
  const blob = typeof data === "string" ? new Blob([(bom ? "\uFEFF" : "") + data], { type: mime }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

export function downloadCsv(filename: string, csv: string) {
  downloadFile(filename, csv, "text/csv;charset=utf-8", true);
}
