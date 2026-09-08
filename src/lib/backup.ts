import type { Collection, GeneralSettings, HistoryRow, Note, ReadingInput, Tariff } from "@/lib/engine/types";

export type MonitorBackup = {
  format: "emonitor-backup";
  version: 1;
  exportedAt: string;
  data: {
    readings: ReadingInput[];
    collections: Collection[];
    history: HistoryRow[];
    notes: Note[];
    general: GeneralSettings;
    tariff1: Tariff;
    tariff2: Tariff;
  };
};

export function makeBackup(state: MonitorBackup["data"]): MonitorBackup {
  return {
    format: "emonitor-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      readings: structuredClone(state.readings),
      collections: structuredClone(state.collections),
      history: structuredClone(state.history),
      notes: structuredClone(state.notes),
      general: structuredClone(state.general),
      tariff1: structuredClone(state.tariff1),
      tariff2: structuredClone(state.tariff2),
    },
  };
}

export function downloadText(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadBackup(data: MonitorBackup["data"]) {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadText(
    `emonitor-backup-${stamp}.json`,
    JSON.stringify(makeBackup(data), null, 2),
    "application/json",
  );
}

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function localDateTime(timestamp: number) {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
  ];
}

export function downloadReadingsCsv(readings: ReadingInput[]) {
  const rows = [
    ["ID", "Date", "Time", "Meter 1", "Meter 2", "Inverter Reading (kW)", "Notes"],
    ...[...readings]
      .sort((a, b) => a.datetime - b.datetime)
      .map((r) => {
        const [date, time] = localDateTime(r.datetime);
        return [r.id, date, time, r.newInput, r.oldInput, r.loadKw, r.notes];
      }),
  ];
  const stamp = new Date().toISOString().slice(0, 10);
  downloadText(
    `emonitor-readings-${stamp}.csv`,
    rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((v) => v.trim() !== "")) rows.push(row);
  }
  return rows;
}

function column(headers: string[], ...names: string[]) {
  return headers.findIndex((h) => names.includes(h.trim().toLowerCase()));
}

function numberValue(value: string | undefined, row: number, field: string) {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`Row ${row}: ${field} is not a valid number.`);
  return n;
}

export function parseReadingsCsv(text: string, existing: ReadingInput[]) {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) throw new Error("The CSV contains no reading rows.");

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const dateI = column(headers, "date");
  const timeI = column(headers, "time");
  const m1I = column(headers, "meter 1", "meter1");
  const m2I = column(headers, "meter 2", "meter2");
  const loadI = column(headers, "inverter reading (kw)", "inverter kw", "load", "load kw");
  const notesI = column(headers, "notes", "note");
  const idI = column(headers, "id");

  if (dateI < 0 || timeI < 0 || m1I < 0 || m2I < 0) {
    throw new Error("CSV must contain Date, Time, Meter 1 and Meter 2 columns.");
  }

  const existingKeys = new Set(existing.map((r) => `${r.datetime}|${r.newInput}|${r.oldInput}|${r.loadKw}`));
  const imported: ReadingInput[] = [];
  let duplicates = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 1;
    if (!row[dateI]?.trim() && !row[timeI]?.trim()) continue;

    const datetime = new Date(`${row[dateI]}T${row[timeI] || "00:00:00"}`).getTime();
    if (!Number.isFinite(datetime)) throw new Error(`Row ${rowNumber}: invalid date/time.`);

    const reading: ReadingInput = {
      id: idI >= 0 && row[idI]?.trim() ? row[idI].trim() : `r-import-${Date.now().toString(36)}-${i}`,
      datetime,
      newInput: numberValue(row[m1I], rowNumber, "Meter 1"),
      oldInput: numberValue(row[m2I], rowNumber, "Meter 2"),
      loadKw: loadI >= 0 ? numberValue(row[loadI], rowNumber, "Inverter Reading") : null,
      notes: notesI >= 0 ? row[notesI] ?? "" : "",
    };

    const key = `${reading.datetime}|${reading.newInput}|${reading.oldInput}|${reading.loadKw}`;
    if (existingKeys.has(key)) {
      duplicates += 1;
      continue;
    }
    existingKeys.add(key);
    imported.push(reading);
  }

  return { readings: imported, duplicates, rows: rows.length - 1 };
}

export function parseBackup(text: string): MonitorBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid eMonitor backup.");
  const backup = parsed as Partial<MonitorBackup>;
  if (backup.format !== "emonitor-backup" || backup.version !== 1 || !backup.data) {
    throw new Error("Unsupported eMonitor backup format or version.");
  }
  const d = backup.data as Partial<MonitorBackup["data"]>;
  if (
    !Array.isArray(d.readings) ||
    !Array.isArray(d.collections) ||
    !Array.isArray(d.history) ||
    !Array.isArray(d.notes) ||
    !d.general ||
    !d.tariff1 ||
    !d.tariff2
  ) {
    throw new Error("The backup is incomplete or corrupted.");
  }
  return backup as MonitorBackup;
}
