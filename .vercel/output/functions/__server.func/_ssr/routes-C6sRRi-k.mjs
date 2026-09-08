import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Zap } from "../_libs/lucide-react.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C6sRRi-k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ESTIMATION_PROFILE = [
	.1743431221,
	.1743431221,
	.1743431221,
	.1743431221,
	.1743431221,
	.1743431221,
	.1743431221,
	.076258988,
	.0108695652,
	.0108695652,
	.0108695652,
	.0108695652,
	.01,
	.01,
	.01,
	.01,
	.01,
	.05625,
	.1408928571,
	.2419340659,
	.1977546071,
	.1743431221,
	.1743431221,
	.1743431221
];
var DEFAULT_GENERAL = {
	goalCombinedUnits: 100,
	billingDay: 13,
	billingHour: 17,
	billingMinute: 0,
	solarStartHour: 7,
	solarStartMinute: 30,
	solarEndHour: 17,
	solarEndMinute: 30
};
var DEFAULT_ADJUSTMENTS = {
	FCA: 0,
	QTA: 0,
	FC: 0,
	NJ: 0,
	ED: 1.5,
	GST: 17,
	TV: 35,
	OtherFixed: 0
};
var DEFAULT_SLABS = [
	{
		min: 1,
		max: 100,
		rate: 37.5,
		fixed: 275
	},
	{
		min: 101,
		max: 200,
		rate: 43.5,
		fixed: 300
	},
	{
		min: 201,
		max: 300,
		rate: 33.1,
		fixed: 350
	},
	{
		min: 301,
		max: 400,
		rate: 36.46,
		fixed: 400
	},
	{
		min: 401,
		max: 500,
		rate: 38.95,
		fixed: 500
	},
	{
		min: 501,
		max: 600,
		rate: 40.22,
		fixed: 675
	},
	{
		min: 601,
		max: 700,
		rate: 41.85,
		fixed: 675
	},
	{
		min: 701,
		max: Infinity,
		rate: 47.2,
		fixed: 675
	}
];
var DEFAULT_PROTECTED = [{
	min: 1,
	max: 100,
	rate: 10.54,
	fixed: 200
}, {
	min: 101,
	max: 200,
	rate: 13.01,
	fixed: 300
}];
function defaultTariff() {
	return {
		effectiveFrom: "06-Feb-2026",
		consumerType: "Unprotected",
		tariff: "A-1 Residential",
		connectionType: "Single Phase",
		slabMode: "ALL_UNITS_AT_APPLICABLE_RATE",
		slabs: DEFAULT_SLABS.map((s) => ({ ...s })),
		protectedSlabs: DEFAULT_PROTECTED.map((s) => ({ ...s })),
		adjustments: { ...DEFAULT_ADJUSTMENTS }
	};
}
function fmtMoney(value) {
	return Number(value || 0).toFixed(2);
}
function fmtUnits(value) {
	return Number(value || 0).toFixed(2).replace(/\.00$/, "");
}
function slabLabel(slab) {
	if (slab.max === Infinity) return "Above 700";
	return `${slab.min}-${slab.max}`;
}
function calculateMeterBill(rawUnits, tariff) {
	let units = Number(rawUnits || 0);
	if (units < 0) units = 0;
	if (units === 0) return {
		units: 0,
		slab: "No consumption",
		rate: 0,
		energy: 0,
		fixed: 0,
		adjustments: 0,
		duty: 0,
		gst: 0,
		tv: 0,
		otherFixed: 0,
		total: 0,
		steps: [{
			label: "Consumption",
			formula: "0 kWh",
			amount: 0
		}]
	};
	const activeSlabs = tariff.consumerType === "Protected" ? tariff.protectedSlabs : tariff.slabs;
	let slab = activeSlabs[activeSlabs.length - 1];
	for (const s of activeSlabs) if (units >= s.min && units <= s.max) {
		slab = s;
		break;
	}
	const steps = [];
	let energy = 0;
	if (tariff.slabMode === "PROGRESSIVE") {
		let remaining = units;
		for (const s of activeSlabs) {
			if (remaining <= 0) break;
			const width = s.max === Infinity ? remaining : Math.min(remaining, Math.max(0, s.max - s.min + 1));
			if (width <= 0) continue;
			const amount = width * s.rate;
			energy += amount;
			steps.push({
				label: `Energy — ${slabLabel(s)}`,
				formula: `${fmtUnits(width)} × Rs ${fmtMoney(s.rate)} = Rs ${fmtMoney(amount)}`,
				amount
			});
			remaining -= width;
		}
	} else {
		energy = units * slab.rate;
		steps.push({
			label: `Energy charges — applicable slab ${slabLabel(slab)}`,
			formula: `${fmtUnits(units)} × Rs ${fmtMoney(slab.rate)} = Rs ${fmtMoney(energy)}`,
			amount: energy
		});
	}
	const fixed = slab.fixed;
	steps.push({
		label: "Fixed charge",
		formula: `Applicable slab fixed charge = Rs ${fmtMoney(fixed)}`,
		amount: fixed
	});
	const perUnit = tariff.adjustments.FCA + tariff.adjustments.QTA + tariff.adjustments.FC + tariff.adjustments.NJ;
	const adjustmentAmount = units * perUnit;
	if (perUnit !== 0) steps.push({
		label: "Per-unit adjustments",
		formula: `${fmtUnits(units)} × Rs ${fmtMoney(perUnit)} = Rs ${fmtMoney(adjustmentAmount)}`,
		amount: adjustmentAmount
	});
	const otherFixed = tariff.adjustments.OtherFixed;
	if (otherFixed !== 0) steps.push({
		label: "Other fixed",
		formula: `Rs ${fmtMoney(otherFixed)}`,
		amount: otherFixed
	});
	const taxableBase = energy + fixed + adjustmentAmount + otherFixed;
	const duty = taxableBase * tariff.adjustments.ED / 100;
	const gst = (taxableBase + duty) * tariff.adjustments.GST / 100;
	const tv = tariff.adjustments.TV;
	if (tariff.adjustments.ED !== 0) steps.push({
		label: "Electricity duty",
		formula: `(${fmtMoney(taxableBase)}) × ${fmtMoney(tariff.adjustments.ED)}% = Rs ${fmtMoney(duty)}`,
		amount: duty
	});
	if (tariff.adjustments.GST !== 0) steps.push({
		label: "GST",
		formula: `(${fmtMoney(taxableBase + duty)}) × ${fmtMoney(tariff.adjustments.GST)}% = Rs ${fmtMoney(gst)}`,
		amount: gst
	});
	if (tv !== 0) steps.push({
		label: "TV fee",
		formula: `Rs ${fmtMoney(tv)}`,
		amount: tv
	});
	const total = energy + fixed + adjustmentAmount + duty + gst + tv + otherFixed;
	steps.push({
		label: "Estimated bill",
		formula: `All charges above = Rs ${fmtMoney(total)}`,
		amount: total,
		total: true
	});
	return {
		units,
		slab: slabLabel(slab),
		rate: slab.rate,
		energy,
		fixed,
		adjustments: adjustmentAmount,
		duty,
		gst,
		tv,
		otherFixed,
		total,
		steps
	};
}
function calculateProRata(baseline, present, extendedDays, standardDays) {
	if (baseline == null || present == null) return null;
	const actual = Number(present) - Number(baseline);
	const days = Math.round(Number(extendedDays || 0));
	const standard = Math.round(Number(standardDays || 0));
	if (!isFinite(actual) || days <= 0 || standard <= 0 || actual < 0) return null;
	const daily = actual / days;
	const billed = Math.floor(daily * standard);
	return {
		baseline: Number(baseline),
		present: Number(present),
		extendedDays: days,
		actualUnits: actual,
		dailyAverage: daily,
		standardDays: standard,
		billedUnits: billed,
		adjustedPresent: Number(baseline) + billed,
		carryForward: actual - billed
	};
}
var DAY_MS = 864e5;
function getBillingPeriodStart(datetime, gs) {
	const start = new Date(datetime.getFullYear(), datetime.getMonth(), gs.billingDay, gs.billingHour, gs.billingMinute, 0, 0);
	if (datetime < start) return new Date(datetime.getFullYear(), datetime.getMonth() - 1, gs.billingDay, gs.billingHour, gs.billingMinute, 0, 0);
	return start;
}
function addMonth(date) {
	return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}
function getFivePmDayStart(datetime, gs) {
	const d = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate(), gs.billingHour, gs.billingMinute, 0, 0);
	if (datetime < d) d.setDate(d.getDate() - 1);
	return d;
}
function billingPeriodLengthDays(periodEnd) {
	const start = new Date(periodEnd.getFullYear(), periodEnd.getMonth() - 1, periodEnd.getDate(), periodEnd.getHours(), periodEnd.getMinutes(), periodEnd.getSeconds(), periodEnd.getMilliseconds());
	const days = (periodEnd.getTime() - start.getTime()) / DAY_MS;
	return days > 0 ? days : 30;
}
function formatBillingMonth(date) {
	return date.toLocaleDateString("en-GB", {
		month: "short",
		year: "numeric"
	});
}
function formatDateTime(date) {
	return date.toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true
	});
}
function ymd(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function profileWeightAt(datetime) {
	return Math.max(1e-6, Number(ESTIMATION_PROFILE[datetime.getHours()] || 0));
}
function profileWeightBetween(start, end) {
	if (end <= start) return 0;
	let total = 0;
	let cursor = new Date(start);
	while (cursor < end) {
		const nextHour = new Date(cursor);
		nextHour.setMinutes(0, 0, 0);
		nextHour.setHours(nextHour.getHours() + 1);
		const segmentEnd = nextHour < end ? nextHour : end;
		const minutes = (segmentEnd.getTime() - cursor.getTime()) / 6e4;
		total += profileWeightAt(cursor) * minutes;
		cursor = segmentEnd;
	}
	return total;
}
function money(value) {
	if (value === "" || value == null || Number.isNaN(Number(value))) return "—";
	return `Rs ${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}
function units(value, digits = 2) {
	if (value === "" || value == null || Number.isNaN(Number(value))) return "—";
	return Number(value).toFixed(digits);
}
function applyCarryForward(readings) {
	let lastNew = null;
	let lastOld = null;
	return readings.map((r) => {
		if (r.newInput !== null) lastNew = r.newInput;
		if (r.oldInput !== null) lastOld = r.oldInput;
		return {
			...r,
			newReading: lastNew,
			oldReading: lastOld
		};
	});
}
function calculateDifference(start, end) {
	if (start == null || end == null) return "";
	const d = end - start;
	return d < 0 ? "" : d;
}
function sumKnown(a, b) {
	if (a === "" && b === "") return "";
	return (a === "" ? 0 : a) + (b === "" ? 0 : b);
}
function interpolateMeter(before, after, target, meter) {
	const key = meter === "new" ? "newReading" : "oldReading";
	if (!before || before[key] == null) return null;
	if (before.datetime === target.getTime()) return before[key];
	if (!after || after[key] == null || after.datetime <= before.datetime) return before[key];
	const b = before[key];
	const a = after[key];
	if (a < b) return null;
	const beforeDt = new Date(before.datetime);
	const totalWeight = profileWeightBetween(beforeDt, new Date(after.datetime));
	if (totalWeight <= 0) {
		const fraction = (target.getTime() - before.datetime) / (after.datetime - before.datetime);
		return b + (a - b) * fraction;
	}
	const targetWeight = profileWeightBetween(beforeDt, target);
	const fraction = Math.max(0, Math.min(1, targetWeight / totalWeight));
	return b + (a - b) * fraction;
}
function interpolatedReadingsAt(readings, boundary) {
	let before = null;
	let after = null;
	const t = boundary.getTime();
	for (const r of readings) if (r.datetime <= t) {
		if (r.newReading != null || r.oldReading != null) before = r;
	} else {
		after = r;
		break;
	}
	return {
		newReading: interpolateMeter(before, after, boundary, "new"),
		oldReading: interpolateMeter(before, after, boundary, "old")
	};
}
function readingsAtOrBefore(readings, boundary) {
	let newReading = null;
	let oldReading = null;
	const t = boundary.getTime();
	for (const r of readings) {
		if (r.datetime > t) break;
		if (r.newReading != null) newReading = r.newReading;
		if (r.oldReading != null) oldReading = r.oldReading;
	}
	return {
		newReading,
		oldReading
	};
}
function estimateReadingAt(readings, target, meter) {
	let before = null;
	let after = null;
	const key = meter === "new" ? "newReading" : "oldReading";
	const t = target.getTime();
	for (const r of readings) {
		if (r.datetime <= t && r[key] != null) before = r;
		if (r.datetime > t && r[key] != null) {
			after = r;
			break;
		}
	}
	return interpolateMeter(before, after, target, meter);
}
var PRIOR_SHRINKAGE_DAYS = 3;
function goalPace(currentUsage, billingStart, billingEnd, now, goal) {
	const usage = Number(currentUsage || 0);
	const totalDays = (billingEnd.getTime() - billingStart.getTime()) / 864e5;
	const elapsedDays = Math.max(0, Math.min(totalDays, (now.getTime() - billingStart.getTime()) / 864e5));
	const remainingDays = Math.max(0, totalDays - elapsedDays);
	const remainingUnits = goal - usage;
	const dailyAverage = elapsedDays > 0 ? usage / elapsedDays : 0;
	const targetDailyAverage = totalDays > 0 ? goal / totalDays : 0;
	let requiredDailyAverage = "";
	if (remainingDays > 0 && remainingUnits > 0) requiredDailyAverage = remainingUnits / remainingDays;
	return {
		goal,
		elapsedDays,
		remainingDays,
		remainingUnits,
		dailyAverage,
		targetDailyAverage,
		requiredDailyAverage,
		overGoal: remainingUnits < 0
	};
}
function last24(readings, now) {
	const startR = interpolatedReadingsAt(readings, /* @__PURE__ */ new Date(now.getTime() - 864e5));
	const endR = readingsAtOrBefore(readings, now);
	const n = calculateDifference(startR.newReading, endR.newReading);
	const o = calculateDifference(startR.oldReading, endR.oldReading);
	return {
		newMeter: n,
		oldMeter: o,
		total: sumKnown(n, o)
	};
}
function getHourlyChartData(readings, dayStart, dayEnd) {
	const output = [];
	let cursor = new Date(dayStart);
	while (cursor < dayEnd) {
		const next = new Date(cursor);
		next.setHours(next.getHours() + 1);
		const newMeter = calculateDifference(estimateReadingAt(readings, cursor, "new"), estimateReadingAt(readings, next, "new"));
		const oldMeter = calculateDifference(estimateReadingAt(readings, cursor, "old"), estimateReadingAt(readings, next, "old"));
		output.push({
			label: cursor.toLocaleTimeString("en-US", { hour: "numeric" }),
			start: cursor.getTime(),
			end: next.getTime(),
			newMeter,
			oldMeter,
			total: sumKnown(newMeter, oldMeter)
		});
		cursor = next;
	}
	return output;
}
function getDailyChartData(readings, periodStart, periodEnd, calculationNow, gs) {
	if (!readings.length) return [];
	const output = [];
	const day = new Date(periodStart);
	while (day < periodEnd) {
		const start = new Date(day);
		const end = new Date(day);
		end.setDate(end.getDate() + 1);
		const startR = interpolatedReadingsAt(readings, start);
		const completed = calculationNow >= end;
		let endR = {
			newReading: null,
			oldReading: null
		};
		if (completed) endR = interpolatedReadingsAt(readings, end);
		else {
			const actual = readingsAtOrBefore(readings, calculationNow);
			const elapsedWeight = profileWeightBetween(start, calculationNow);
			const fullWeight = profileWeightBetween(start, end);
			if (elapsedWeight > 0 && fullWeight > 0 && startR.newReading != null && actual.newReading != null) {
				const observed = calculateDifference(startR.newReading, actual.newReading);
				if (observed !== "") endR.newReading = Number(startR.newReading) + Number(observed) * fullWeight / elapsedWeight;
			}
			if (elapsedWeight > 0 && fullWeight > 0 && startR.oldReading != null && actual.oldReading != null) {
				const observed = calculateDifference(startR.oldReading, actual.oldReading);
				if (observed !== "") endR.oldReading = Number(startR.oldReading) + Number(observed) * fullWeight / elapsedWeight;
			}
		}
		const newMeter = calculateDifference(startR.newReading, endR.newReading);
		const oldMeter = calculateDifference(startR.oldReading, endR.oldReading);
		if (endR.newReading != null || endR.oldReading != null) output.push({
			label: start.toLocaleDateString("en-GB", { day: "2-digit" }),
			date: ymd(start),
			period: `${start.toLocaleString("en-GB", {
				day: "2-digit",
				month: "short"
			})} ${gs.billingHour}:00 → ${end.toLocaleString("en-GB", {
				day: "2-digit",
				month: "short"
			})} ${gs.billingHour}:00`,
			newMeter,
			oldMeter,
			total: sumKnown(newMeter, oldMeter),
			completed
		});
		day.setDate(day.getDate() + 1);
	}
	return output;
}
function blendedDailyRate(observedTotal, observedDays, priorPerDay) {
	if (priorPerDay == null) return observedDays > 0 ? observedTotal / observedDays : 0;
	return (observedTotal + priorPerDay * PRIOR_SHRINKAGE_DAYS) / (observedDays + PRIOR_SHRINKAGE_DAYS);
}
function priorPeriodDailyAverages(readings, billingStart) {
	if (!readings.length || readings[0].datetime >= billingStart.getTime()) return null;
	const priorStart = new Date(billingStart.getFullYear(), billingStart.getMonth() - 1, billingStart.getDate(), billingStart.getHours(), billingStart.getMinutes(), 0, 0);
	const days = (billingStart.getTime() - priorStart.getTime()) / 864e5;
	if (days <= 0) return null;
	const startR = interpolatedReadingsAt(readings, priorStart);
	const endR = interpolatedReadingsAt(readings, billingStart);
	const newTotal = calculateDifference(startR.newReading, endR.newReading);
	const oldTotal = calculateDifference(startR.oldReading, endR.oldReading);
	return {
		newPerDay: newTotal === "" ? null : newTotal / days,
		oldPerDay: oldTotal === "" ? null : oldTotal / days
	};
}
function projectMonth(daily, billingStart, billingEnd, now, readings) {
	const startKey = ymd(billingStart);
	const endKey = ymd(billingEnd);
	const periodDaily = daily.filter((d) => d.date >= startKey && d.date < endKey);
	let completedNew = 0;
	let completedOld = 0;
	let completedDays = 0;
	let currentDay = null;
	for (const d of periodDaily) if (d.completed) {
		if (d.newMeter !== "") completedNew += Number(d.newMeter);
		if (d.oldMeter !== "") completedOld += Number(d.oldMeter);
		completedDays++;
	} else currentDay = d;
	const fullPeriodDays = (billingEnd.getTime() - billingStart.getTime()) / 864e5;
	let partialFullNew = 0;
	let partialFullOld = 0;
	if (currentDay) {
		const gsDummy = {
			billingHour: billingStart.getHours(),
			billingMinute: billingStart.getMinutes()
		};
		const dayStart = getFivePmDayStart(now, {
			goalCombinedUnits: 0,
			billingDay: 13,
			billingHour: gsDummy.billingHour,
			billingMinute: gsDummy.billingMinute,
			solarStartHour: 7,
			solarStartMinute: 30,
			solarEndHour: 17,
			solarEndMinute: 30
		});
		const dayEnd = new Date(dayStart);
		dayEnd.setDate(dayEnd.getDate() + 1);
		const elapsedWeight = profileWeightBetween(dayStart, now);
		const fullWeight = profileWeightBetween(dayStart, dayEnd);
		const fraction = fullWeight > 0 ? elapsedWeight / fullWeight : 0;
		const partialNew = currentDay.newMeter === "" ? 0 : Number(currentDay.newMeter);
		const partialOld = currentDay.oldMeter === "" ? 0 : Number(currentDay.oldMeter);
		const completedDailyNew = periodDaily.filter((d) => d.completed && d.newMeter !== "").map((d) => Number(d.newMeter));
		const fallbackNew = completedDailyNew.length ? completedDailyNew.reduce((a, b) => a + b, 0) / completedDailyNew.length : 0;
		const completedDailyOld = periodDaily.filter((d) => d.completed && d.oldMeter !== "").map((d) => Number(d.oldMeter));
		const fallbackOld = completedDailyOld.length ? completedDailyOld.reduce((a, b) => a + b, 0) / completedDailyOld.length : 0;
		if (fraction >= .1 && elapsedWeight > 0 && fullWeight > 0) {
			partialFullNew = partialNew * fullWeight / elapsedWeight;
			partialFullOld = partialOld * fullWeight / elapsedWeight;
		} else {
			partialFullNew = Math.max(partialNew, fallbackNew);
			partialFullOld = Math.max(partialOld, fallbackOld);
		}
	}
	const futureDays = Math.max(0, fullPeriodDays - completedDays - (currentDay ? 1 : 0));
	const prior = priorPeriodDailyAverages(readings, billingStart);
	const observedDaysCount = completedDays + (currentDay ? 1 : 0);
	const futureNew = blendedDailyRate(completedNew + partialFullNew, observedDaysCount, prior?.newPerDay ?? null);
	const futureOld = blendedDailyRate(completedOld + partialFullOld, observedDaysCount, prior?.oldPerDay ?? null);
	const projectedNew = completedNew + partialFullNew + futureNew * futureDays;
	const projectedOld = completedOld + partialFullOld + futureOld * futureDays;
	return {
		newMeter: projectedNew,
		oldMeter: projectedOld,
		total: projectedNew + projectedOld
	};
}
function collectionDateTime(c) {
	const dt = /* @__PURE__ */ new Date(`${c.date}T${c.time || "00:00"}:00`);
	return Number.isNaN(dt.getTime()) ? null : dt;
}
function carryFromCollections(meter, boundary, collections, readings) {
	const label = formatBillingMonth(boundary).toLowerCase();
	const list = collections.filter((c) => c.meter === meter);
	const byLabel = list.filter((c) => c.month.trim().toLowerCase() === label);
	const prior = (byLabel.length ? byLabel : list).map((c) => ({
		c,
		dt: collectionDateTime(c)
	})).filter((x) => x.dt).sort((a, b) => a.dt.getTime() - b.dt.getTime()).at(-1)?.c;
	if (!prior) return null;
	const std = billingPeriodLengthDays(boundary);
	const billed = calculateProRata(prior.previousBaseline, prior.rawReading, prior.extendedDays || std, std);
	if (!billed) return null;
	const at = interpolatedReadingsAt(readings, boundary);
	const boundaryReading = meter === "METER 1" ? at.newReading : at.oldReading;
	let carryForward = billed.carryForward;
	if (boundaryReading != null && isFinite(Number(boundaryReading))) carryForward = Number(boundaryReading) - billed.adjustedPresent;
	return {
		...billed,
		carryForward,
		boundaryReading
	};
}
function availableMonths(readings, now, gs) {
	const map = /* @__PURE__ */ new Map();
	const current = getBillingPeriodStart(now, gs);
	map.set(ymd(current), current);
	for (const r of readings) {
		const start = getBillingPeriodStart(new Date(r.datetime), gs);
		map.set(ymd(start), start);
	}
	return [...map.values()].sort((a, b) => b.getTime() - a.getTime()).map((start) => {
		const end = addMonth(start);
		return {
			key: ymd(start),
			value: String(start.getTime()),
			label: formatBillingMonth(end)
		};
	});
}
function computeDashboard(opts) {
	const { inputs, now, gs, tariff1, tariff2, collections } = opts;
	const readings = applyCarryForward([...inputs].sort((a, b) => a.datetime - b.datetime));
	if (!readings.length) return {
		empty: true,
		message: "No meter readings yet. Add one on the Readings tab."
	};
	const currentStart = getBillingPeriodStart(now, gs);
	const billingStart = opts.selectedStart ?? currentStart;
	const billingEnd = addMonth(billingStart);
	const isCurrent = billingStart.getTime() === currentStart.getTime();
	const periodNow = isCurrent ? now : billingEnd;
	const startR = interpolatedReadingsAt(readings, billingStart);
	const endR = isCurrent && now < billingEnd ? readingsAtOrBefore(readings, now) : interpolatedReadingsAt(readings, billingEnd);
	const billingNew = calculateDifference(startR.newReading, endR.newReading);
	const billingOld = calculateDifference(startR.oldReading, endR.oldReading);
	const billingTotal = sumKnown(billingNew, billingOld);
	const fullPeriodDays = (billingEnd.getTime() - billingStart.getTime()) / 864e5;
	const elapsedDays = isCurrent ? Math.max(0, Math.min(fullPeriodDays, (periodNow.getTime() - billingStart.getTime()) / 864e5)) : fullPeriodDays;
	const daily = getDailyChartData(readings, billingStart, billingEnd, isCurrent ? now : billingEnd, gs);
	const projection = isCurrent ? projectMonth(daily, billingStart, billingEnd, now, readings) : {
		newMeter: billingNew === "" ? 0 : Number(billingNew),
		oldMeter: billingOld === "" ? 0 : Number(billingOld),
		total: (billingNew === "" ? 0 : Number(billingNew)) + (billingOld === "" ? 0 : Number(billingOld))
	};
	const periodReadings = readings.filter((r) => r.datetime >= billingStart.getTime() && r.datetime < billingEnd.getTime());
	const latest = (periodReadings.length ? periodReadings : readings).at(-1) ?? null;
	const last24h = last24(readings, now);
	const carry1 = carryFromCollections("METER 1", billingStart, collections, readings);
	const carry2 = carryFromCollections("METER 2", billingStart, collections, readings);
	const carryForwardNew = carry1?.carryForward ?? 0;
	const carryForwardOld = carry2?.carryForward ?? 0;
	const totalConsumptionNew = (billingNew === "" ? 0 : billingNew) + carryForwardNew;
	const totalConsumptionOld = (billingOld === "" ? 0 : billingOld) + carryForwardOld;
	const totalConsumptionCombined = totalConsumptionNew + totalConsumptionOld;
	const currentBill1 = calculateMeterBill(billingNew === "" ? 0 : billingNew, tariff1);
	const currentBill2 = calculateMeterBill(billingOld === "" ? 0 : billingOld, tariff2);
	const projectedBill1 = calculateMeterBill(projection.newMeter, tariff1);
	const projectedBill2 = calculateMeterBill(projection.oldMeter, tariff2);
	const half = (isCurrent ? projection.total : Number(billingTotal || 0)) / 2;
	const split1 = calculateMeterBill(half, tariff1);
	const split2 = calculateMeterBill(half, tariff2);
	const periodStd = billingPeriodLengthDays(billingStart);
	const pro1 = calculateProRata(startR.newReading, latest?.newReading ?? null, elapsedDays, periodStd);
	const pro2 = calculateProRata(startR.oldReading, latest?.oldReading ?? null, elapsedDays, periodStd);
	const hourly = getHourlyChartData(readings, isCurrent ? /* @__PURE__ */ new Date(now.getTime() - 864e5) : getFivePmDayStart(billingEnd, gs), isCurrent ? now : billingEnd);
	const hourlyDays = daily.filter((d) => d.total !== "").map((d) => ({
		value: d.date,
		label: (/* @__PURE__ */ new Date(d.date + "T00:00:00")).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		})
	}));
	if (isCurrent) hourlyDays.unshift({
		value: "last24",
		label: "Last 24 hours"
	});
	const shareBase = billingTotal === "" || billingTotal <= 0 ? 0 : billingTotal;
	return {
		empty: false,
		latestDate: latest ? formatDateTime(new Date(latest.datetime)) : formatBillingMonth(billingStart),
		latestTimestamp: latest?.datetime ?? billingStart.getTime(),
		currentNew: latest?.newReading ?? null,
		currentOld: latest?.oldReading ?? null,
		initialNew: startR.newReading,
		initialOld: startR.oldReading,
		billingNew,
		billingOld,
		billingTotal,
		elapsedDays,
		averageNew: billingNew !== "" && elapsedDays > 0 ? billingNew / elapsedDays : "",
		averageOld: billingOld !== "" && elapsedDays > 0 ? billingOld / elapsedDays : "",
		last24Total: last24h.total,
		last24New: last24h.newMeter,
		last24Old: last24h.oldMeter,
		projectedNew: projection.newMeter,
		projectedOld: projection.oldMeter,
		projectedTotal: projection.total,
		meter1Share: shareBase ? Number(billingNew || 0) / shareBase * 100 : 0,
		meter2Share: shareBase ? Number(billingOld || 0) / shareBase * 100 : 0,
		carryForwardNew,
		carryForwardOld,
		totalConsumptionNew,
		totalConsumptionOld,
		totalConsumptionCombined,
		currentBillNew: currentBill1.total,
		currentBillOld: currentBill2.total,
		currentBillDetails: {
			meter1: currentBill1,
			meter2: currentBill2
		},
		projectedBillDetails: {
			meter1: split1,
			meter2: split2
		},
		projectedBillActualDetails: {
			meter1: projectedBill1,
			meter2: projectedBill2
		},
		projectedBill5050Total: split1.total + split2.total,
		projectedBillActualTotal: projectedBill1.total + projectedBill2.total,
		proRata: {
			meter1: pro1,
			meter2: pro2,
			standardDays: periodStd
		},
		billingMonth: formatBillingMonth(billingEnd),
		billingStart: formatDateTime(billingStart),
		billingEnd: formatDateTime(billingEnd),
		billingProgress: isCurrent ? Math.max(0, Math.min(100, (now.getTime() - billingStart.getTime()) / (billingEnd.getTime() - billingStart.getTime()) * 100)) : 100,
		goalPace: goalPace(totalConsumptionCombined, billingStart, billingEnd, isCurrent ? now : billingEnd, gs.goalCombinedUnits),
		daily,
		hourly,
		hourlyDay: isCurrent ? "last24" : hourlyDays.at(-1)?.value ?? "",
		hourlyDays,
		isCurrentBillingMonth: isCurrent,
		availableMonthKey: ymd(billingStart),
		effectiveCurrentRate: (isCurrent ? projection.total : Number(billingTotal || 0)) > 0 ? (isCurrent ? split1.total + split2.total : currentBill1.total + currentBill2.total) / (isCurrent ? projection.total : Number(billingTotal || 0)) : 0,
		carried: readings
	};
}
function hourlyForDay(inputs, dayKey, now, gs) {
	const readings = applyCarryForward([...inputs].sort((a, b) => a.datetime - b.datetime));
	if (dayKey === "last24") return getHourlyChartData(readings, /* @__PURE__ */ new Date(now.getTime() - 864e5), now);
	const dayStart = /* @__PURE__ */ new Date(`${dayKey}T${String(gs.billingHour).padStart(2, "0")}:${String(gs.billingMinute).padStart(2, "0")}:00`);
	const dayEnd = new Date(dayStart);
	dayEnd.setDate(dayEnd.getDate() + 1);
	let end = dayEnd;
	if (now >= dayStart && now < dayEnd) end = now;
	return getHourlyChartData(readings, dayStart, end);
}
function mulberry32(seed) {
	return () => {
		seed |= 0;
		seed = seed + 1831565813 | 0;
		let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function id(prefix, n) {
	return `${prefix}-${n}`;
}
function seedReadings() {
	const rnd = mulberry32(20260813);
	const rows = [];
	let meter1 = 2435;
	let meter2 = 4854;
	const start = new Date(2026, 6, 13, 18, 10, 0, 0);
	const end = new Date(2026, 8, 8, 8, 0, 0, 0);
	let cursor = new Date(start);
	let n = 1;
	while (cursor <= end) {
		const hour = cursor.getHours();
		const isSolar = hour >= 8 && hour < 17;
		const base = isSolar ? .04 + rnd() * .08 : .12 + rnd() * .22;
		meter1 += base * (.45 + rnd() * .2);
		meter2 += base * (.45 + rnd() * .25);
		rows.push({
			id: id("r", n++),
			datetime: cursor.getTime(),
			newInput: Number(meter1.toFixed(2)),
			oldInput: Number(meter2.toFixed(2)),
			notes: "",
			loadKw: isSolar ? Number((.4 + rnd() * 1.8).toFixed(2)) : Number((.8 + rnd() * 2.4).toFixed(2))
		});
		const next = new Date(cursor);
		const stepH = hour < 7 ? 4 : hour < 12 ? 3 : hour < 18 ? 2 : 4;
		next.setHours(next.getHours() + stepH, Math.floor(rnd() * 20), 0, 0);
		cursor = next;
	}
	return rows;
}
function seedCollections() {
	return [{
		id: "c-1",
		month: "Aug 2026",
		meter: "METER 1",
		date: "2026-08-15",
		time: "12:05",
		previousBaseline: 2435,
		rawReading: 2598.1,
		extendedDays: 33,
		standardDays: 31
	}, {
		id: "c-2",
		month: "Aug 2026",
		meter: "METER 2",
		date: "2026-08-15",
		time: "12:06",
		previousBaseline: 4854,
		rawReading: 4951.44,
		extendedDays: 33,
		standardDays: 31
	}];
}
function seedHistory() {
	const m1 = [
		[
			"Jul 25",
			133,
			1362,
			1419
		],
		[
			"Aug 25",
			100,
			1112,
			1112
		],
		[
			"Sep 25",
			131,
			1515,
			1515
		],
		[
			"Oct 25",
			116,
			1318,
			1318
		],
		[
			"Nov 25",
			46,
			540,
			540
		],
		[
			"Dec 25",
			64,
			851,
			0
		],
		[
			"Jan 26",
			55,
			1666,
			1666
		],
		[
			"Feb 26",
			59,
			841,
			841
		],
		[
			"Mar 26",
			84,
			1952,
			1952
		],
		[
			"Apr 26",
			61,
			1635,
			1635
		],
		[
			"May 26",
			51,
			1399,
			1399
		],
		[
			"Jun 26",
			166,
			3413,
			0
		]
	];
	const m2 = [
		[
			"Jul 25",
			111,
			1087,
			1133
		],
		[
			"Aug 25",
			122,
			1421,
			1421
		],
		[
			"Sep 25",
			94,
			1022,
			1022
		],
		[
			"Oct 25",
			104,
			1154,
			1154
		],
		[
			"Nov 25",
			86,
			1010,
			1010
		],
		[
			"Dec 25",
			50,
			664,
			0
		],
		[
			"Jan 26",
			71,
			1681,
			1681
		],
		[
			"Feb 26",
			41,
			586,
			586
		],
		[
			"Mar 26",
			23,
			921,
			921
		],
		[
			"Apr 26",
			37,
			1042,
			1042
		],
		[
			"May 26",
			64,
			1339,
			1339
		],
		[
			"Jun 26",
			165,
			3011,
			3011
		]
	];
	return [...m1.map((r, i) => ({
		id: `h1-${i}`,
		month: r[0],
		meter: "METER 1",
		status: "EX",
		units: r[1],
		bill: r[2],
		payment: r[3]
	})), ...m2.map((r, i) => ({
		id: `h2-${i}`,
		month: r[0],
		meter: "METER 2",
		status: "EX",
		units: r[1],
		bill: r[2],
		payment: r[3]
	}))];
}
function seedNotes() {
	return [{
		id: "n-1",
		timestamp: new Date(2026, 7, 15, 12, 20).getTime(),
		text: "Official collection logged 15 Aug around noon. Baseline rolled forward from July."
	}, {
		id: "n-2",
		timestamp: new Date(2026, 7, 22, 19, 5).getTime(),
		text: "Evening load spike after guests. Inverter stayed on-grid overnight."
	}];
}
function uid(prefix) {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
var demo = () => ({
	readings: seedReadings(),
	collections: seedCollections(),
	history: seedHistory(),
	notes: seedNotes(),
	general: { ...DEFAULT_GENERAL },
	tariff1: defaultTariff(),
	tariff2: defaultTariff()
});
var useMonitor = create()(persist((set, get) => ({
	...demo(),
	tab: "summary",
	selectedMonth: null,
	assume5050: true,
	hourlyDay: "last24",
	hourlyOverride: null,
	setTab: (tab) => set({ tab }),
	setMonth: (value) => set({
		selectedMonth: value,
		hourlyOverride: null
	}),
	setAssume5050: (assume5050) => set({ assume5050 }),
	setHourlyDay: (hourlyDay) => {
		const s = get();
		set({
			hourlyDay,
			hourlyOverride: hourlyForDay(s.readings, hourlyDay, /* @__PURE__ */ new Date(), s.general)
		});
	},
	addReading: (r) => set({ readings: [...get().readings, {
		...r,
		id: uid("r")
	}] }),
	updateReading: (id, r) => set({ readings: get().readings.map((x) => x.id === id ? {
		...x,
		...r
	} : x) }),
	deleteReading: (id) => set({ readings: get().readings.filter((x) => x.id !== id) }),
	addNote: (text) => set({ notes: [{
		id: uid("n"),
		timestamp: Date.now(),
		text
	}, ...get().notes] }),
	deleteNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),
	addCollection: (c) => set({ collections: [...get().collections, {
		...c,
		id: uid("c")
	}] }),
	saveGeneral: (general) => set({ general }),
	saveTariffs: (tariff1, tariff2) => set({
		tariff1,
		tariff2
	}),
	resetDemo: () => set({
		...demo(),
		selectedMonth: null,
		hourlyOverride: null
	})
}), {
	name: "electricity-monitor-v1",
	storage: createJSONStorage(() => localStorage),
	skipHydration: true,
	partialize: (s) => ({
		readings: s.readings,
		collections: s.collections,
		history: s.history,
		notes: s.notes,
		general: s.general,
		tariff1: s.tariff1,
		tariff2: s.tariff2
	})
}));
function useDashboard() {
	const readings = useMonitor((s) => s.readings);
	const collections = useMonitor((s) => s.collections);
	const general = useMonitor((s) => s.general);
	const tariff1 = useMonitor((s) => s.tariff1);
	const tariff2 = useMonitor((s) => s.tariff2);
	const selectedMonth = useMonitor((s) => s.selectedMonth);
	const now = /* @__PURE__ */ new Date();
	const months = availableMonths(readings, now, general);
	const selectedStart = selectedMonth ? new Date(Number(selectedMonth)) : null;
	return {
		dashboard: computeDashboard({
			inputs: readings,
			now,
			selectedStart: selectedStart && !Number.isNaN(selectedStart.getTime()) ? selectedStart : null,
			gs: general,
			tariff1,
			tariff2,
			collections
		}),
		months,
		now
	};
}
function BillBlock({ title, bill }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "overflow-hidden rounded-xl border border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between bg-muted/50 px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-medium",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-sm tabular-nums text-muted",
				children: [units(bill.units), " kWh"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: bill.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: `grid gap-1 border-t border-border px-4 py-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_auto] ${step.total ? "bg-muted/40 font-medium" : ""}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: step.label }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs text-muted sm:text-sm",
					children: step.formula
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums sm:text-right",
					children: money(step.amount)
				})
			]
		}, step.label)) })]
	});
}
function ProBlock({ title, data }) {
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
		className: "font-medium",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-sm text-muted",
		children: "Insufficient baseline for this meter."
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
		className: "font-medium",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
		className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3",
		children: [
			[
				"Previous billed baseline",
				"baseline",
				"kWh"
			],
			[
				"Present live reading",
				"present",
				"kWh"
			],
			[
				"Total actual units",
				"actualUnits",
				"kWh"
			],
			[
				"Extended interval",
				"extendedDays",
				"days"
			],
			[
				"Daily velocity",
				"dailyAverage",
				"kWh/d"
			],
			[
				"Standard cycle",
				"standardDays",
				"days"
			],
			[
				"Normalized billed units",
				"billedUnits",
				"kWh"
			],
			[
				"Adjusted present",
				"adjustedPresent",
				"kWh"
			],
			[
				"Carry-forward",
				"carryForward",
				"kWh"
			]
		].map(([label, key, unit]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
			className: "tabular-nums",
			children: [
				units(data[key]),
				" ",
				unit
			]
		})] }, key))
	})] });
}
function BillView() {
	const { dashboard } = useDashboard();
	const assume5050 = useMonitor((s) => s.assume5050);
	const setAssume5050 = useMonitor((s) => s.setAssume5050);
	if (dashboard.empty) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl bg-elevated p-10 text-center shadow-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "No bill estimate yet."
		})
	});
	const details = dashboard.isCurrentBillingMonth ? assume5050 ? dashboard.projectedBillDetails : dashboard.projectedBillActualDetails : dashboard.currentBillDetails;
	const total = (details.meter1.total || 0) + (details.meter2.total || 0);
	const kwh = dashboard.isCurrentBillingMonth ? Number(dashboard.projectedTotal || 0) : Number(dashboard.billingTotal || 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-medium",
						children: dashboard.isCurrentBillingMonth ? "Projected month bill" : "Billing month calculation"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							dashboard.isCurrentBillingMonth ? "Projected" : "Recorded",
							" consumption",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								className: "text-foreground tabular-nums",
								children: [units(kwh), " kWh"]
							})
						]
					})] }), dashboard.isCurrentBillingMonth ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: assume5050,
							onChange: (e) => setAssume5050(e.target.checked),
							className: "size-4 accent-foreground"
						}), "Assume 50/50 split"]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillBlock, {
						title: "Meter 1",
						bill: details.meter1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillBlock, {
						title: "Meter 2",
						bill: details.meter2
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex items-center justify-between rounded-xl bg-foreground px-5 py-4 text-background",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Combined"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-2xl tabular-nums",
						children: money(total)
					})]
				}),
				assume5050 && dashboard.isCurrentBillingMonth ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted",
					children: "Both meters billed as half of projected consumption."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-subtle",
					children: "Each meter is billed independently on the A-1 residential tariff. Combined is the sum of the two bills."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
			className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "cursor-pointer font-display text-lg font-medium",
					children: "Pro-rata normalization"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Billed units = floor((Present − Baseline) ÷ Extended days × Standard days). Audit view only."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProBlock, {
						title: "Meter 1",
						data: dashboard.proRata.meter1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProBlock, {
						title: "Meter 2",
						data: dashboard.proRata.meter2
					})]
				})
			]
		})]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
			outline: "border border-border bg-transparent text-foreground hover:bg-muted",
			ghost: "text-foreground hover:bg-muted",
			destructive: "bg-danger text-danger-fg hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-foreground placeholder:text-subtle outline-none transition-[box-shadow] duration-[var(--motion-quick)] focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-24 w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium tracking-wide text-muted", className),
		...props
	});
}
function HistoryTable({ title, rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "mb-3 font-medium",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[28rem] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "text-left text-xs uppercase tracking-wider text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 font-medium",
						children: "Month"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 font-medium",
						children: "Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 text-right font-medium",
						children: "Units"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 text-right font-medium",
						children: "Bill"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-2 text-right font-medium",
						children: "Paid"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5",
						children: r.month
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 text-muted",
						children: r.status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 text-right tabular-nums",
						children: units(r.units, 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 text-right tabular-nums",
						children: money(r.bill)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 text-right tabular-nums",
						children: money(r.payment)
					})
				]
			}, r.id)) })]
		})
	})] });
}
function HistoryView() {
	const history = useMonitor((s) => s.history);
	const collections = useMonitor((s) => s.collections);
	const addCollection = useMonitor((s) => s.addCollection);
	const [meter, setMeter] = (0, import_react.useState)("METER 1");
	const [date, setDate] = (0, import_react.useState)("2026-09-08");
	const [time, setTime] = (0, import_react.useState)("12:00");
	const [raw, setRaw] = (0, import_react.useState)("");
	const [month, setMonth] = (0, import_react.useState)("");
	const [baseline, setBaseline] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-medium",
						children: "Billing history"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Recorded units, bill and payment by meter."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-8 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryTable, {
							title: "Meter 1",
							rows: history.filter((h) => h.meter === "METER 1")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryTable, {
							title: "Meter 2",
							rows: history.filter((h) => h.meter === "METER 2")
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-medium",
						children: "Log a collection"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Official reading near the 13th 5 PM cycle. Month and baseline can be left blank to auto-fill later."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						onSubmit: (e) => {
							e.preventDefault();
							if (!date || !time || raw === "") return;
							addCollection({
								meter,
								date,
								time,
								rawReading: Number(raw),
								previousBaseline: baseline === "" ? 0 : Number(baseline),
								month: month || "Sep 2026"
							});
							setRaw("");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "col-meter",
								children: "Meter"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "col-meter",
								value: meter,
								onChange: (e) => setMeter(e.target.value),
								className: "mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "METER 1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "METER 2" })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "col-date",
								children: "Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "col-date",
								type: "date",
								className: "mt-1",
								value: date,
								onChange: (e) => setDate(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "col-time",
								children: "Time"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "col-time",
								type: "time",
								className: "mt-1",
								value: time,
								onChange: (e) => setTime(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "col-raw",
								children: "Raw reading"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "col-raw",
								type: "number",
								step: "0.01",
								className: "mt-1",
								value: raw,
								onChange: (e) => setRaw(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "col-month",
								children: "Month override"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "col-month",
								className: "mt-1",
								placeholder: "auto",
								value: month,
								onChange: (e) => setMonth(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "col-base",
								children: "Baseline override"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "col-base",
								type: "number",
								step: "0.01",
								className: "mt-1",
								placeholder: "auto",
								value: baseline,
								onChange: (e) => setBaseline(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									children: "Save collection"
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-medium",
					children: "Collection audit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-3",
					children: collections.map((c) => {
						const actual = c.rawReading - c.previousBaseline;
						const ext = Math.round(c.extendedDays || 30);
						const std = Math.round(c.standardDays || 30);
						const daily = ext > 0 ? actual / ext : 0;
						const billed = Math.floor(daily * std);
						const carry = actual - billed;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-xl border border-border p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-medium",
								children: [
									c.month,
									" — ",
									c.meter
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted",
										children: "Collected"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
										c.date,
										" ",
										c.time
									] })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted",
										children: "Baseline"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "tabular-nums",
										children: units(c.previousBaseline)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted",
										children: "Raw"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "tabular-nums",
										children: units(c.rawReading)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted",
										children: "Actual units"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "tabular-nums",
										children: units(actual)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
										className: "text-xs text-muted",
										children: [
											"Billed (",
											std,
											"d)"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "tabular-nums",
										children: units(billed)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted",
										children: "Carry-forward"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "tabular-nums",
										children: units(carry)
									})] })
								]
							})]
						}, c.id);
					})
				})]
			})
		]
	});
}
function NotesView() {
	const notes = useMonitor((s) => s.notes);
	const addNote = useMonitor((s) => s.addNote);
	const deleteNote = useMonitor((s) => s.deleteNote);
	const [text, setText] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-medium",
				children: "Operational notes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Meter changes, maintenance, unusual load, tariff updates."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: text,
					onChange: (e) => setText(e.target.value),
					placeholder: "Write a note",
					className: "flex-1"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "self-end",
					onClick: () => {
						if (!text.trim()) return;
						addNote(text.trim());
						setText("");
					},
					children: "Add note"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-3",
				children: notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-8 text-center text-sm text-muted",
					children: "No notes yet."
				}) : notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "whitespace-pre-wrap text-pretty text-sm leading-relaxed",
						children: n.text
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(n.timestamp).toLocaleString() }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => deleteNote(n.id),
							children: "Remove"
						})]
					})]
				}, n.id))
			})
		]
	});
}
function pad(n) {
	return String(n).padStart(2, "0");
}
function nowParts() {
	const n = /* @__PURE__ */ new Date();
	return {
		date: `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`,
		time: `${pad(n.getHours())}:${pad(n.getMinutes())}`
	};
}
function ReadingsView() {
	const readings = useMonitor((s) => s.readings);
	const addReading = useMonitor((s) => s.addReading);
	const deleteReading = useMonitor((s) => s.deleteReading);
	const latest = (0, import_react.useMemo)(() => [...readings].sort((a, b) => b.datetime - a.datetime)[0], [readings]);
	const [date, setDate] = (0, import_react.useState)(nowParts().date);
	const [time, setTime] = (0, import_react.useState)(nowParts().time);
	const [m1, setM1] = (0, import_react.useState)(latest?.newInput != null ? String(latest.newInput) : "");
	const [m2, setM2] = (0, import_react.useState)(latest?.oldInput != null ? String(latest.oldInput) : "");
	const [load, setLoad] = (0, import_react.useState)("");
	const sorted = (0, import_react.useMemo)(() => [...readings].sort((a, b) => b.datetime - a.datetime), [readings]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-medium",
				children: "Readings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Add a snapshot. Blank meter fields keep the previous carry-forward."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6",
				onSubmit: (e) => {
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
						notes: ""
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: date,
						onChange: (e) => setDate(e.target.value),
						"aria-label": "Date"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "time",
						value: time,
						onChange: (e) => setTime(e.target.value),
						"aria-label": "Time"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						step: "0.01",
						placeholder: "Meter 1",
						value: m1,
						onChange: (e) => setM1(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						step: "0.01",
						placeholder: "Meter 2",
						value: m2,
						onChange: (e) => setM2(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						step: "0.01",
						placeholder: "Inverter kW",
						value: load,
						onChange: (e) => setLoad(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Add reading"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[40rem] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-left text-xs uppercase tracking-wider text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "When"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 text-right font-medium",
								children: "Meter 1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 text-right font-medium",
								children: "Meter 2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 text-right font-medium",
								children: "Load"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "pb-2 font-medium" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sorted.slice(0, 80).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5",
								children: new Date(r.datetime).toLocaleString("en-GB", {
									day: "2-digit",
									month: "short",
									hour: "numeric",
									minute: "2-digit"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 text-right tabular-nums",
								children: units(r.newInput)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 text-right tabular-nums",
								children: units(r.oldInput)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 text-right tabular-nums",
								children: units(r.loadKw)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => deleteReading(r.id),
									children: "Remove"
								})
							})
						]
					}, r.id)) })]
				})
			})
		]
	});
}
function Field({ label, value, onChange, type = "text" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		className: "mt-1",
		type,
		value,
		onChange: (e) => onChange(e.target.value)
	})] });
}
function TariffEditor({ title, value, onChange }) {
	const setAdj = (key, v) => onChange({
		...value,
		adjustments: {
			...value.adjustments,
			[key]: Number(v)
		}
	});
	const setSlab = (i, field, v) => {
		const slabs = value.slabs.map((s, idx) => idx === i ? {
			...s,
			[field]: Number(v)
		} : s);
		onChange({
			...value,
			slabs
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "rounded-xl border border-border p-4",
		open: title.includes("1"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "cursor-pointer font-medium",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Consumer type",
						value: value.consumerType,
						onChange: (v) => onChange({
							...value,
							consumerType: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Slab mode",
						value: value.slabMode,
						onChange: (v) => onChange({
							...value,
							slabMode: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "GST %",
						value: value.adjustments.GST,
						type: "number",
						onChange: (v) => setAdj("GST", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Electricity duty %",
						value: value.adjustments.ED,
						type: "number",
						onChange: (v) => setAdj("ED", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "TV fee",
						value: value.adjustments.TV,
						type: "number",
						onChange: (v) => setAdj("TV", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Other fixed",
						value: value.adjustments.OtherFixed,
						type: "number",
						onChange: (v) => setAdj("OtherFixed", v)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs uppercase tracking-wider text-muted",
				children: "Slabs (rate / fixed)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid gap-2",
				children: value.slabs.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[7rem_1fr_1fr] items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: s.max === Infinity ? "Above 700" : `${s.min}–${s.max}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							step: "0.01",
							value: s.rate,
							onChange: (e) => setSlab(i, "rate", e.target.value),
							"aria-label": `${s.min} rate`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							step: "0.01",
							value: s.fixed,
							onChange: (e) => setSlab(i, "fixed", e.target.value),
							"aria-label": `${s.min} fixed`
						})
					]
				}, s.min))
			})
		]
	});
}
function SettingsView() {
	const general = useMonitor((s) => s.general);
	const t1 = useMonitor((s) => s.tariff1);
	const t2 = useMonitor((s) => s.tariff2);
	const saveGeneral = useMonitor((s) => s.saveGeneral);
	const saveTariffs = useMonitor((s) => s.saveTariffs);
	const resetDemo = useMonitor((s) => s.resetDemo);
	const [g, setG] = (0, import_react.useState)(general);
	const [a, setA] = (0, import_react.useState)(t1);
	const [b, setB] = (0, import_react.useState)(t2);
	const [saved, setSaved] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-medium",
					children: "General"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Goal combined units",
							type: "number",
							value: g.goalCombinedUnits,
							onChange: (v) => setG({
								...g,
								goalCombinedUnits: Number(v)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Billing day",
							type: "number",
							value: g.billingDay,
							onChange: (v) => setG({
								...g,
								billingDay: Number(v)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Billing hour",
							type: "number",
							value: g.billingHour,
							onChange: (v) => setG({
								...g,
								billingHour: Number(v)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Billing minute",
							type: "number",
							value: g.billingMinute,
							onChange: (v) => setG({
								...g,
								billingMinute: Number(v)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Solar start hour",
							type: "number",
							value: g.solarStartHour,
							onChange: (v) => setG({
								...g,
								solarStartHour: Number(v)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Solar end hour",
							type: "number",
							value: g.solarEndHour,
							onChange: (v) => setG({
								...g,
								solarEndHour: Number(v)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5",
					onClick: () => {
						saveGeneral(g);
						setSaved("General settings saved.");
					},
					children: "Save general"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-medium",
					children: "Meter tariffs"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "MEPCO A-1 residential slabs. Each meter can differ."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TariffEditor, {
						title: "Meter 1",
						value: a,
						onChange: setA
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TariffEditor, {
						title: "Meter 2",
						value: b,
						onChange: setB
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							saveTariffs(a, b);
							setSaved("Tariffs saved.");
						},
						children: "Save tariffs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => {
							resetDemo();
							setSaved("Demo data restored.");
						},
						children: "Restore demo data"
					})]
				}),
				saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: saved
				}) : null
			]
		})]
	});
}
function toRows(points) {
	return points.map((p) => ({
		label: p.label,
		meter1: p.newMeter === "" ? 0 : Number(p.newMeter),
		meter2: p.oldMeter === "" ? 0 : Number(p.oldMeter)
	}));
}
function ChartTooltip({ active, payload, label }) {
	if (!active || !payload?.length) return null;
	const m1 = payload.find((p) => p.dataKey === "meter1")?.value ?? 0;
	const m2 = payload.find((p) => p.dataKey === "meter2")?.value ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-elevated px-3 py-2 text-xs shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1 font-medium text-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-meter1",
				children: [
					"Meter 1 · ",
					units(m1),
					" kWh"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-meter2",
				children: [
					"Meter 2 · ",
					units(m2),
					" kWh"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-muted",
				children: [
					"Total · ",
					units(m1 + m2),
					" kWh"
				]
			})
		]
	});
}
function UsageChart({ points, onBarClick }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	const data = toRows(points);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-80 w-full rounded-lg bg-muted/40" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-80 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data,
				margin: {
					top: 8,
					right: 4,
					left: -18,
					bottom: 0
				},
				onClick: (state) => {
					if (onBarClick && state?.activeTooltipIndex != null) onBarClick(Number(state.activeTooltipIndex));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-border)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "label",
						tick: {
							fill: "var(--color-muted)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						interval: "preserveStartEnd"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tick: {
							fill: "var(--color-muted)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						width: 40
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltip, {}),
						cursor: { fill: "color-mix(in oklab, var(--color-fg) 6%, transparent)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey: "meter1",
						stackId: "s",
						fill: "var(--color-meter1)",
						maxBarSize: 22
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey: "meter2",
						stackId: "s",
						fill: "var(--color-meter2)",
						radius: [
							3,
							3,
							0,
							0
						],
						maxBarSize: 22
					})
				]
			})
		})
	});
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wider text-muted",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-xl font-medium tabular-nums text-foreground",
			children: value
		}),
		hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 text-xs text-subtle",
			children: hint
		}) : null
	] });
}
function MeterCard({ title, tone, total, billing, carry, average, bill, current, initial }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-1 w-12 rounded-full ${tone === "meter1" ? "bg-meter1" : "bg-meter2"}` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs font-medium uppercase tracking-wider text-muted",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-display text-3xl font-medium tabular-nums",
				children: [
					units(total),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-base text-subtle",
						children: "kWh"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-xs text-subtle tabular-nums",
				children: [
					units(billing),
					" + ",
					units(carry)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-muted",
						children: "Average"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "tabular-nums",
						children: [units(average), " kWh/d"]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-muted",
						children: "Bill so far"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular-nums",
						children: money(bill)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-muted",
						children: "Current"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular-nums",
						children: units(current)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-muted",
						children: "Period start"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular-nums",
						children: units(initial)
					})] })
				]
			})
		]
	});
}
function SummaryView() {
	const { dashboard } = useDashboard();
	const setHourlyDay = useMonitor((s) => s.setHourlyDay);
	const hourlyDay = useMonitor((s) => s.hourlyDay);
	const hourlyOverride = useMonitor((s) => s.hourlyOverride);
	if (dashboard.empty) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl bg-elevated p-10 text-center shadow-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xl",
			children: dashboard.message
		})
	});
	const d = dashboard;
	const hourly = hourlyOverride ?? d.hourly;
	const pace = d.goalPace;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl font-medium tracking-tight text-balance",
							children: d.billingMonth
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								d.billingStart,
								" → ",
								d.billingEnd
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-subtle tabular-nums",
							children: [
								"Elapsed ",
								units(d.elapsedDays, 1),
								" days"
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium tabular-nums text-muted",
						children: [Number(d.billingProgress).toFixed(0), "% of period"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative mt-4 h-2 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-foreground transition-[width] duration-[var(--motion-slow)]",
						style: { width: `${Math.min(100, d.billingProgress)}%` }
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl bg-elevated p-5 shadow-border lg:col-span-2 sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wider text-muted",
							children: "Total usage"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex flex-wrap items-end justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-5xl font-medium tracking-tight tabular-nums",
								children: [units(d.totalConsumptionCombined), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-lg font-normal text-subtle",
									children: "kWh"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: d.isCurrentBillingMonth ? "Projected bill (50/50)" : "Calculated bill"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl tabular-nums",
									children: money(d.projectedBill5050Total)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-mono text-xs text-subtle tabular-nums",
							children: [
								units(d.billingTotal),
								" + ",
								units((d.carryForwardNew || 0) + (d.carryForwardOld || 0))
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Last 24 h",
									value: `${units(d.last24Total)} kWh`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Daily avg",
									value: `${units(pace.dailyAverage)} kWh/d`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "To goal",
									value: pace.remainingUnits > 0 ? `${units(pace.remainingUnits)} kWh` : "Exceeded"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Required daily",
									value: pace.requiredDailyAverage === "" ? pace.overGoal ? "Over" : "—" : `${units(pace.requiredDailyAverage)} kWh/d`
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-pretty text-sm text-muted",
							children: pace.overGoal ? `Combined goal exceeded by ${units(Math.abs(pace.remainingUnits))} kWh.` : `Stay at or below ${pace.requiredDailyAverage === "" ? "0" : units(pace.requiredDailyAverage)} kWh/d to finish on target.`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1.5 flex justify-between text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Meter 1 · ",
									units(d.billingNew),
									" kWh"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Meter 2 · ",
									units(d.billingOld),
									" kWh"
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-2 overflow-hidden rounded-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "bg-meter1",
									style: { width: `${d.meter1Share}%` }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "bg-meter2",
									style: { width: `${d.meter2Share}%` }
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeterCard, {
						title: "Meter 1",
						tone: "meter1",
						total: d.totalConsumptionNew,
						billing: d.billingNew,
						carry: d.carryForwardNew,
						average: d.averageNew === "" ? "" : Number(d.averageNew),
						bill: d.currentBillNew,
						current: d.currentNew,
						initial: d.initialNew
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeterCard, {
						title: "Meter 2",
						tone: "meter2",
						total: d.totalConsumptionOld,
						billing: d.billingOld,
						carry: d.carryForwardOld,
						average: d.averageOld === "" ? "" : Number(d.averageOld),
						bill: d.currentBillOld,
						current: d.currentOld,
						initial: d.initialOld
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-medium",
						children: "Daily consumption"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-sm bg-meter1" }), " Meter 1"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-sm bg-meter2" }), " Meter 2"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsageChart, {
					points: d.daily,
					onBarClick: (i) => {
						const point = d.daily[i];
						if (point) setHourlyDay(point.date);
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-elevated p-5 shadow-border sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-medium",
						children: "Hourly consumption"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: hourlyDay,
						onChange: (e) => setHourlyDay(e.target.value),
						className: "h-11 rounded-md border border-border bg-surface px-3 text-sm",
						children: d.hourlyDays.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: opt.value,
							children: opt.label
						}, opt.value))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsageChart, { points: hourly })]
			})
		]
	});
}
var TABS = [
	{
		id: "summary",
		label: "Summary"
	},
	{
		id: "bill",
		label: "Bill"
	},
	{
		id: "history",
		label: "History"
	},
	{
		id: "readings",
		label: "Readings"
	},
	{
		id: "notes",
		label: "Notes"
	},
	{
		id: "settings",
		label: "Settings"
	}
];
function AppShell() {
	const tab = useMonitor((s) => s.tab);
	const setTab = useMonitor((s) => s.setTab);
	const selectedMonth = useMonitor((s) => s.selectedMonth);
	const setMonth = useMonitor((s) => s.setMonth);
	const { dashboard, months } = useDashboard();
	const latest = dashboard.empty ? "No readings yet" : `Latest ${dashboard.latestDate}`;
	(0, import_react.useEffect)(() => {
		useMonitor.persist.rehydrate();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-10 items-center justify-center rounded-lg bg-foreground text-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
							className: "size-4",
							strokeWidth: 1.75
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate font-display text-lg font-medium tracking-tight",
							children: "Electricity Monitor"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: latest
						})]
					})]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex gap-1 overflow-x-auto rounded-xl bg-elevated p-1.5 shadow-border",
						children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: cn("h-10 shrink-0 rounded-lg px-3", tab === t.id && "bg-foreground text-background hover:bg-foreground"),
							onClick: () => setTab(t.id),
							children: t.label
						}, t.id))
					}), months.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-12 items-center gap-2 rounded-xl bg-elevated px-3 shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium uppercase tracking-wider text-muted",
							children: "Month"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "bg-transparent text-sm font-medium outline-none",
							value: selectedMonth ?? months[0]?.value,
							onChange: (e) => setMonth(e.target.value),
							children: months.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.value,
								children: m.label
							}, m.value))
						})]
					}) : null]
				}),
				tab === "summary" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryView, {}) : null,
				tab === "bill" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BillView, {}) : null,
				tab === "history" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryView, {}) : null,
				tab === "readings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadingsView, {}) : null,
				tab === "notes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesView, {}) : null,
				tab === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsView, {}) : null
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { Home as component };
