// scripts/sync-lance.mjs
// Push enriched ticker data from data/<code>/enriched.json into a LanceDB
// table hosted on Rig1. Intended for nightly/operator-triggered runs.
//
// The LanceDB endpoint is TBD — set the env vars below. The script posts
// NDJSON batches (100 records at a time) to `${LANCE_DB_URL}/ingest/${LANCE_DB_TABLE}`.
// If your Rig1 ingress uses a different path, adjust ENDPOINT_TEMPLATE.
//
// Usage:
//   node scripts/sync-lance.mjs --dry-run    # log only, do not POST
//   node scripts/sync-lance.mjs             # POST batches to LanceDB
//
// Env vars (all required unless --dry-run):
//   LANCE_DB_URL      base URL, e.g. http://rig1.manifestoagency.co:8000
//   LANCE_DB_TOKEN    bearer token
//   LANCE_DB_TABLE    target table name, e.g. tickers

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = path.join(__dirname, "..", "data");
const MARKETS_FILE = path.join(DATA_ROOT, "markets.json");

const BATCH_SIZE = 100;
// Path template for the LanceDB ingest endpoint. Operator adjusts if Rig1
// exposes a different shape (e.g. /v1/table/:name/insert).
const ENDPOINT_TEMPLATE = (table) => `/ingest/${table}`;

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");

const REQUIRED_ENV = ["LANCE_DB_URL", "LANCE_DB_TOKEN", "LANCE_DB_TABLE"];

function log(...parts) {
  console.log("[sync-lance]", ...parts);
}

function err(...parts) {
  console.error("[sync-lance]", ...parts);
}

async function loadJson(p) {
  return JSON.parse(await readFile(p, "utf8"));
}

function buildText(record) {
  const parts = [
    record.name,
    record.description,
    record.sector,
    record.industry,
  ].filter((v) => typeof v === "string" && v.trim().length > 0);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function buildRecord(raw, market) {
  const code = market.code;
  const symbol = raw.symbol;
  // Stable id: {symbol}-{market_code}. Stays in sync with the existing
  // data/<code>/tickers.json symbol across runs.
  const id = `${symbol}-${code}`;

  const record = {
    id,
    symbol,
    name: raw.name ?? "",
    exchange: raw.exchange ?? "",
    sector: raw.sector ?? "",
    industry: raw.industry ?? "",
    country: raw.country ?? market.code.toUpperCase(),
    currency: raw.currency ?? market.currency ?? "",
    isin: raw.isin ?? null,
    description: raw.description ?? "",
    themes: Array.isArray(raw.themes) ? raw.themes : [],
    // Default index membership to the market's primary index (e.g. S&P 500).
    // If the enriched record already carries an index_membership array, honour it.
    index_membership:
      Array.isArray(raw.index_membership) && raw.index_membership.length > 0
        ? raw.index_membership
        : market.primaryIndex
          ? [market.primaryIndex]
          : [],
    addedAt: raw.addedAt ?? null,
    market_code: code,
    market_name: market.name,
    text: buildText(raw),
  };
  return record;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function postBatch(url, token, ndjson) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-ndjson",
      Authorization: `Bearer ${token}`,
      "User-Agent": "manifesto-markets/sync-lance (+bot)",
    },
    body: ndjson,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `POST ${url} -> ${res.status} ${res.statusText}${body ? `: ${body.slice(0, 240)}` : ""}`
    );
  }
  return res;
}

async function syncMarket(market) {
  const enrichedPath = path.join(DATA_ROOT, market.code, "enriched.json");
  let raw;
  try {
    raw = await loadJson(enrichedPath);
  } catch (e) {
    if (e && e.code === "ENOENT") {
      log(`[${market.code}] skipped (no enriched.json)`);
      return { code: market.code, skipped: true, count: 0, batches: 0, ok: 0 };
    }
    throw e;
  }

  const records = raw.map((r) => buildRecord(r, market));
  const batches = chunk(records, BATCH_SIZE);
  log(
    `[${market.code}] ${records.length} record(s) -> ${batches.length} batch(es)`
  );

  if (DRY_RUN) {
    if (records[0]) {
      log(
        `[${market.code}] sample[0] = ${JSON.stringify({
          id: records[0].id,
          symbol: records[0].symbol,
          name: records[0].name,
          market_code: records[0].market_code,
          themes: records[0].themes,
          index_membership: records[0].index_membership,
          text_len: records[0].text.length,
        })}`
      );
    }
    return { code: market.code, count: records.length, batches: batches.length, ok: batches.length, dryRun: true };
  }

  const url = `${process.env.LANCE_DB_URL.replace(/\/+$/, "")}${ENDPOINT_TEMPLATE(process.env.LANCE_DB_TABLE)}`;
  const token = process.env.LANCE_DB_TOKEN;

  let ok = 0;
  for (let i = 0; i < batches.length; i++) {
    const ndjson = batches[i].map((r) => JSON.stringify(r)).join("\n") + "\n";
    try {
      await postBatch(url, token, ndjson);
      ok++;
      log(`[${market.code}] batch ${i + 1}/${batches.length} ok`);
    } catch (e) {
      err(`[${market.code}] batch ${i + 1}/${batches.length} failed: ${e.message}`);
    }
  }

  return { code: market.code, count: records.length, batches: batches.length, ok };
}

async function main() {
  if (!DRY_RUN) {
    const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      err(
        `missing required env var(s): ${missing.join(", ")}. ` +
          `Run with --dry-run to skip the network call.`
      );
      process.exit(2);
    }
  }

  const markets = await loadJson(MARKETS_FILE);
  const results = [];
  for (const m of markets) {
    try {
      const r = await syncMarket(m);
      results.push(r);
    } catch (e) {
      err(`[${m.code}] fatal: ${e.message}`);
      results.push({ code: m.code, error: e.message });
    }
  }

  // Summary
  const totals = results.reduce(
    (acc, r) => {
      acc.records += r.count ?? 0;
      acc.batches += r.batches ?? 0;
      acc.ok += r.ok ?? 0;
      if (r.error) acc.failed++;
      if (r.skipped) acc.skipped++;
      return acc;
    },
    { records: 0, batches: 0, ok: 0, failed: 0, skipped: 0 }
  );

  log("--- summary ---");
  for (const r of results) {
    if (r.skipped) {
      log(`  ${r.code}: skipped`);
    } else if (r.error) {
      log(`  ${r.code}: ERROR (${r.error})`);
    } else {
      log(`  ${r.code}: ${r.count} records, ${r.ok}/${r.batches} batches`);
    }
  }
  log(
    `totals: ${totals.records} records, ${totals.ok}/${totals.batches} batches ok, ${totals.failed} failed, ${totals.skipped} skipped${DRY_RUN ? " (dry-run)" : ""}`
  );

  if (totals.failed > 0) process.exit(1);
}

main().catch((e) => {
  err(e.stack || e.message || String(e));
  process.exit(1);
});