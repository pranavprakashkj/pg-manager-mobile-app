// Latency benchmark for the spike Worker.
// Usage:
//   API_URL=https://pgm-phase0-spike.<acct>.workers.dev TOKEN=<clerk session token> ORG_ID=<uuid> \
//   N=60 node scripts/bench.mjs
// Measures client-observed latency (sequential requests over a kept-alive connection, after warm-up)
// and summarises the Worker's own Server-Timing stages. Writes results/bench-<timestamp>.json.
import { mkdirSync, writeFileSync } from "node:fs";

const base = (process.env.API_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");
const token = process.env.TOKEN ?? "";
const orgId = process.env.ORG_ID ?? "";
const N = +(process.env.N ?? 60);
const WARMUP = +(process.env.WARMUP ?? 5);

const endpoints = [
  { name: "health", path: "/health", auth: false },
  { name: "me", path: "/me", auth: true },
  { name: "db-test", path: "/db-test", auth: true },
  ...(orgId ? [{ name: "inventory", path: `/orgs/${orgId}/inventory-test`, auth: true }] : []),
];

const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1))];
};
const round = (x) => Math.round(x * 10) / 10;

function parseServerTiming(h) {
  const out = {};
  for (const part of (h ?? "").split(",")) {
    const m = part.trim().match(/^([\w-]+);dur=([\d.]+)/);
    if (m) out[m[1]] = +m[2];
  }
  return out;
}

const report = { base, measuredAt: new Date().toISOString(), n: N, endpoints: {} };
let colo = null;

for (const ep of endpoints) {
  const headers = ep.auth ? { Authorization: `Bearer ${token}` } : {};
  const client = [];
  const stages = {};
  let status = null;
  let bedCount;
  for (let i = 0; i < WARMUP + N; i++) {
    const t = performance.now();
    const res = await fetch(base + ep.path, { headers });
    const body = await res.json();
    const ms = performance.now() - t;
    status = res.status;
    if (ep.name === "health") colo = body.colo;
    if (body.bedCount != null) bedCount = body.bedCount;
    if (i < WARMUP) continue;
    client.push(ms);
    for (const [k, v] of Object.entries(parseServerTiming(res.headers.get("server-timing")))) (stages[k] ??= []).push(v);
  }
  const summary = {
    status,
    ...(bedCount != null ? { bedCount } : {}),
    clientMs: { p50: round(pct(client, 50)), p95: round(pct(client, 95)), min: round(Math.min(...client)), max: round(Math.max(...client)) },
    serverStagesMs: Object.fromEntries(
      Object.entries(stages).map(([k, v]) => [k, { p50: round(pct(v, 50)), p95: round(pct(v, 95)) }])
    ),
  };
  report.endpoints[ep.name] = summary;
  console.log(
    `${ep.name.padEnd(10)} status=${status} client p50=${summary.clientMs.p50}ms p95=${summary.clientMs.p95}ms  ` +
      Object.entries(summary.serverStagesMs).map(([k, v]) => `${k}:${v.p50}/${v.p95}`).join(" ")
  );
}
report.workerColo = colo;
console.log(`worker colo: ${colo}`);

mkdirSync(new URL("../results/", import.meta.url), { recursive: true });
const file = new URL(`../results/bench-${Date.now()}.json`, import.meta.url);
writeFileSync(file, JSON.stringify(report, null, 2));
console.log(`saved ${file.pathname}`);
