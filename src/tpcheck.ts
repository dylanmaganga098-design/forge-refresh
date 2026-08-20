import { buildOhlcCsv } from "/dev-server/src/lib/ohlc-generator";
import { runAnalysis } from "/dev-server/src/lib/analyzer/run";
import { TWELVE_DATA_API_KEYS } from "/dev-server/src/lib/market-data";

const end = "2026-08-19";
const start = "2026-07-20";
const csv = await buildOhlcCsv({
  symbol: "XAU/USD", startDate: start, endDate: end,
  specifyTime: false, startTime: "00:00", endTime: "23:59",
  apiKeys: TWELVE_DATA_API_KEYS, keyIndexRef: { current: 0 },
  log: (m: string) => {}, setCooldown: () => {},
} as any);
if (!csv) { console.log("no csv"); process.exit(1); }
const out = runAnalysis(csv);
if (!out.ok) { console.log("fail", out.error); process.exit(1); }
const a = out.analysis;
console.log("rows", a.analyzedRows, "pass", a.passing.length);
const by: Record<string, {n:number, rrs:number[], tps:Set<string>}> = {};
for (const r of a.passing) {
  const b = (by[r.strategy] ??= {n:0, rrs:[], tps:new Set()});
  b.n++; b.rrs.push(Number(r.rr?.toFixed(1))); b.tps.add(String(r.tp));
}
for (const [k,v] of Object.entries(by)) {
  console.log(k.padEnd(38), "n="+v.n, "rr:", v.rrs.slice(0,10).join(","), "| uniqueTP=", v.tps.size, [...v.tps].slice(0,4).join(","));
}
