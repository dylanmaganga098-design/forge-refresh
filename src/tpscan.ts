import { buildOhlcCsv } from "/dev-server/src/lib/ohlc-generator";
import { runAnalysis } from "/dev-server/src/lib/analyzer/run";
import { TWELVE_DATA_API_KEYS } from "/dev-server/src/lib/market-data";
const windows = [["XAU/USD","2026-05-20","2026-06-19"],["EUR/USD","2026-07-20","2026-08-19"],["GBP/JPY","2026-07-20","2026-08-19"]];
for (const [sym,start,end] of windows) {
  const csv = await buildOhlcCsv({symbol:sym,startDate:start,endDate:end,specifyTime:false,startTime:"00:00",endTime:"23:59",apiKeys:TWELVE_DATA_API_KEYS,keyIndexRef:{current:0},log:()=>{},setCooldown:()=>{}} as any);
  if (!csv) { console.log(sym,"no csv"); continue; }
  const out = runAnalysis(csv);
  if (!out.ok) { console.log(sym, out.error); continue; }
  const p = out.analysis.passing;
  const hi = p.filter(r=>(r.rr??0)>15);
  const tpCount = new Map<string,number>();
  for (const r of p) tpCount.set(`${r.strategy}|${r.tp}`, (tpCount.get(`${r.strategy}|${r.tp}`)??0)+1);
  const dup = [...tpCount].filter(([,c])=>c>2);
  console.log(sym, "pass", p.length, "maxRR", Math.max(0,...p.map(r=>r.rr??0)).toFixed(1), "rr>15:", hi.length, hi.slice(0,5).map(r=>`${r.strategy} rr=${r.rr?.toFixed(0)} tp=${r.tp}`).join(" ; "), "| dupTP:", dup.slice(0,5).map(([k,c])=>`${k} x${c}`).join(" ; "));
}
