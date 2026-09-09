import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import type { Collection, GeneralSettings, HistoryRow, Note, ReadingInput, Tariff } from "@/lib/engine/types";

const readingSchema = z.object({
  id: z.string(),
  datetime: z.number().finite(),
  newInput: z.number().finite().nullable(),
  oldInput: z.number().finite().nullable(),
  notes: z.string(),
  loadKw: z.number().finite().nullable(),
});

const collectionSchema = z.object({
  id: z.string(),
  month: z.string(),
  meter: z.enum(["METER 1", "METER 2"]),
  date: z.string(),
  time: z.string(),
  previousBaseline: z.number().finite(),
  rawReading: z.number().finite(),
  extendedDays: z.number().int().nullable().optional(),
  standardDays: z.number().int().nullable().optional(),
});

const historySchema = z.object({
  id: z.string(),
  month: z.string(),
  meter: z.enum(["METER 1", "METER 2"]),
  status: z.string(),
  units: z.number().finite(),
  bill: z.number().finite(),
  payment: z.number().finite(),
});

const noteSchema = z.object({
  id: z.string(),
  timestamp: z.number().finite(),
  text: z.string(),
});

export type MonitorSnapshot = {
  readings: ReadingInput[];
  collections: Collection[];
  history: HistoryRow[];
  notes: Note[];
  general: GeneralSettings | null;
  tariff1: Tariff | null;
  tariff2: Tariff | null;
};

export const loadMonitor = createServerFn({ method: "GET" }).handler(async (): Promise<MonitorSnapshot> => {
  const sql = await getSql();
  const [readings, collections, history, notes, settings] = await Promise.all([
    sql.query<{
      id: string; datetime: number; new_input: number | null; old_input: number | null;
      notes: string; load_kw: number | null;
    }>("select id, datetime, new_input, old_input, notes, load_kw from monitor_readings order by datetime asc"),
    sql.query<{
      id: string; month: string; meter: "METER 1" | "METER 2"; date: string; time: string;
      previous_baseline: number; raw_reading: number; extended_days: number | null; standard_days: number | null;
    }>("select id, month, meter, date, time, previous_baseline, raw_reading, extended_days, standard_days from monitor_collections order by month asc, date asc"),
    sql.query<{
      id: string; month: string; meter: "METER 1" | "METER 2"; status: string; units: number; bill: number; payment: number;
    }>("select id, month, meter, status, units, bill, payment from monitor_history order by month asc"),
    sql.query<{ id: string; timestamp: number; text: string }>("select id, timestamp, text from monitor_notes order by timestamp desc"),
    sql.query<{ key: string; value: unknown }>("select key, value from monitor_settings where key in ('general', 'tariff1', 'tariff2')"),
  ]);

  const settingMap = new Map(settings.map((row) => [row.key, row.value]));
  return {
    readings: readings.map((r) => ({ id: r.id, datetime: Number(r.datetime), newInput: r.new_input, oldInput: r.old_input, notes: r.notes, loadKw: r.load_kw })),
    collections: collections.map((c) => ({ id: c.id, month: c.month, meter: c.meter, date: c.date, time: c.time, previousBaseline: c.previous_baseline, rawReading: c.raw_reading, extendedDays: c.extended_days ?? undefined, standardDays: c.standard_days ?? undefined })),
    history: history.map((h) => ({ id: h.id, month: h.month, meter: h.meter, status: h.status, units: h.units, bill: h.bill, payment: h.payment })),
    notes,
    general: (settingMap.get("general") as GeneralSettings | undefined) ?? null,
    tariff1: (settingMap.get("tariff1") as Tariff | undefined) ?? null,
    tariff2: (settingMap.get("tariff2") as Tariff | undefined) ?? null,
  };
});

export const saveReading = createServerFn({ method: "POST" }).validator(readingSchema).handler(async ({ data }) => {
  const r = data;
  const sql = await getSql();
  await sql.query(
    "insert into monitor_readings (id, datetime, new_input, old_input, notes, load_kw) values ($1,$2,$3,$4,$5,$6) on conflict (id) do update set datetime=excluded.datetime, new_input=excluded.new_input, old_input=excluded.old_input, notes=excluded.notes, load_kw=excluded.load_kw, updated_at=now()",
    [r.id, r.datetime, r.newInput, r.oldInput, r.notes, r.loadKw],
  );
  return r;
});

export const deleteReadingServer = createServerFn({ method: "POST" }).validator(z.object({ id: z.string() })).handler(async ({ data }) => {
  const sql = await getSql();
  await sql.query("delete from monitor_readings where id = $1", [data.id]);
});

export const saveCollection = createServerFn({ method: "POST" }).validator(collectionSchema).handler(async ({ data }) => {
  const sql = await getSql();
  await sql.query(
    "insert into monitor_collections (id,month,meter,date,time,previous_baseline,raw_reading,extended_days,standard_days) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (id) do update set month=excluded.month,meter=excluded.meter,date=excluded.date,time=excluded.time,previous_baseline=excluded.previous_baseline,raw_reading=excluded.raw_reading,extended_days=excluded.extended_days,standard_days=excluded.standard_days,updated_at=now()",
    [data.id,data.month,data.meter,data.date,data.time,data.previousBaseline,data.rawReading,data.extendedDays ?? null,data.standardDays ?? null],
  );
  return data;
});

export const saveHistory = createServerFn({ method: "POST" }).validator(historySchema).handler(async ({ data }) => {
  const sql = await getSql();
  await sql.query(
    "insert into monitor_history (id,month,meter,status,units,bill,payment) values ($1,$2,$3,$4,$5,$6,$7) on conflict (id) do update set month=excluded.month,meter=excluded.meter,status=excluded.status,units=excluded.units,bill=excluded.bill,payment=excluded.payment,updated_at=now()",
    [data.id,data.month,data.meter,data.status,data.units,data.bill,data.payment],
  );
  return data;
});

export const saveNote = createServerFn({ method: "POST" }).validator(noteSchema).handler(async ({ data }) => {
  const sql = await getSql();
  await sql.query(
    "insert into monitor_notes (id,timestamp,text) values ($1,$2,$3) on conflict (id) do update set timestamp=excluded.timestamp,text=excluded.text,updated_at=now()",
    [data.id,data.timestamp,data.text],
  );
  return data;
});

export const deleteNoteServer = createServerFn({ method: "POST" }).validator(z.object({ id: z.string() })).handler(async ({ data }) => {
  const sql = await getSql();
  await sql.query("delete from monitor_notes where id = $1", [data.id]);
});

export const saveSetting = createServerFn({ method: "POST" })
  .validator(z.object({ key: z.enum(["general", "tariff1", "tariff2"]), value: z.unknown() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      "insert into monitor_settings (key,value) values ($1,$2::jsonb) on conflict (key) do update set value=excluded.value,updated_at=now()",
      [data.key, JSON.stringify(data.value)],
    );
  });
