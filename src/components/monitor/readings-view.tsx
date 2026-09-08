import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { units } from "@/lib/engine/time";
import { useMonitor } from "@/store/monitor";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function nowParts() {
  const n = new Date();
  return {
    date: `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`,
    time: `${pad(n.getHours())}:${pad(n.getMinutes())}`,
  };
}

export function ReadingsView() {
  const readings = useMonitor((s) => s.readings);
  const addReading = useMonitor((s) => s.addReading);
  const deleteReading = useMonitor((s) => s.deleteReading);
  const latest = useMemo(
    () => [...readings].sort((a, b) => b.datetime - a.datetime)[0],
    [readings],
  );
  const [date, setDate] = useState(nowParts().date);
  const [time, setTime] = useState(nowParts().time);
  const [m1, setM1] = useState(latest?.newInput != null ? String(latest.newInput) : "");
  const [m2, setM2] = useState(latest?.oldInput != null ? String(latest.oldInput) : "");
  const [load, setLoad] = useState("");

  const sorted = useMemo(
    () => [...readings].sort((a, b) => b.datetime - a.datetime),
    [readings],
  );

  return (
    <section className="rounded-2xl bg-elevated p-5 shadow-border sm:p-6">
      <h2 className="font-display text-2xl font-medium">Readings</h2>
      <p className="mt-1 text-sm text-muted">Add a snapshot. Blank meter fields keep the previous carry-forward.</p>

      <form
        className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!date || !time) return;
          const [y, mo, d] = date.split("-").map(Number);
          const [h, mi] = time.split(":").map(Number);
          const dt = new Date(y, mo - 1, d, h, mi, 0, 0);
          addReading({
            datetime: dt.getTime(),
            newInput: m1 === "" ? null : Number(m1),
            oldInput: m2 === "" ? null : Number(m2),
            loadKw: load === "" ? null : Number(load),
            notes: "",
          });
        }}
      >
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time" />
        <Input type="number" step="0.01" placeholder="Meter 1" value={m1} onChange={(e) => setM1(e.target.value)} />
        <Input type="number" step="0.01" placeholder="Meter 2" value={m2} onChange={(e) => setM2(e.target.value)} />
        <Input type="number" step="0.01" placeholder="Inverter kW" value={load} onChange={(e) => setLoad(e.target.value)} />
        <Button type="submit">Add reading</Button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted">
              <th className="pb-2 font-medium">When</th>
              <th className="pb-2 text-right font-medium">Meter 1</th>
              <th className="pb-2 text-right font-medium">Meter 2</th>
              <th className="pb-2 text-right font-medium">Load</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 80).map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2.5">
                  {new Date(r.datetime).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2.5 text-right tabular-nums">{units(r.newInput)}</td>
                <td className="py-2.5 text-right tabular-nums">{units(r.oldInput)}</td>
                <td className="py-2.5 text-right tabular-nums">{units(r.loadKw)}</td>
                <td className="py-2.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => deleteReading(r.id)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
