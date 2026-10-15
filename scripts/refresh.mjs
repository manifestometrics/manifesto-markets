// scripts/refresh.mjs
// Daily refresh of per-market price + news JSON. Reads RSS feeds listed in
// data/<market>/rss.json, auto-tags tickers, and writes data/<market>/news.json.
// Prices are pulled via the unofficial Yahoo Finance endpoint (no API key).

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = path.join(__dirname, "..", "data");

const MARKETS_FILE = path.join(DATA_ROOT, "markets.json");

async function loadJson(p) {
  return JSON.parse(await readFile(p, "utf8"));
}

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "manifesto-markets/0.1 (+bot)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; manifesto-markets/0.1; +bot)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch price + 1-month daily history for one ticker via Yahoo Finance's
 * unofficial chart endpoint. Returns null if Yahoo blocks us or returns
 * no data — caller should fall back to mock prices.
 */
async function fetchYahooChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=1d&range=1mo`;
  const data = await fetchJson(url);
  const result = data?.chart?.result?.[0];
  if (!result) return null;

  const meta = result.meta ?? {};
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const timestamps = result.timestamp ?? [];

  const series = [];
  for (let i = 0; i < closes.length; i++) {
    const v = closes[i];
    if (v == null) continue;
    series.push({
      time: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
      value: Math.round(v * 100) / 100,
    });
  }

  const price = meta.regularMarketPrice ?? series.at(-1)?.value ?? null;
  const prevClose = meta.chartPreviousClose ?? series.at(-2)?.value ?? null;
  if (price == null) return null;
  const change =
    prevClose != null ? Math.round((price - prevClose) * 100) / 100 : 0;
  const changePct =
    prevClose != null && prevClose !== 0
      ? Math.round(((price - prevClose) / prevClose) * 10000) / 100
      : 0;

  return {
    price,
    change,
    changePct,
    currency: meta.currency ?? "USD",
    asOf: new Date(
      (meta.regularMarketTime ?? Date.now() / 1000) * 1000
    ).toISOString(),
    series,
  };
}

/** Naive RSS → JSON: extract <item><title>, <link>, <pubDate>, <description>. */
function parseRss(xml) {
  const items = [];
  const re = /<item[\s\S]*?<\/item>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[0];
    const get = (tag) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
      const x = block.match(r);
      return x ? x[1].trim().replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1") : "";
    };
    const title = get("title");
    const link = get("link") || get("guid");
    const pubDate = get("pubDate") || get("dc:date");
    const description = get("description");
    if (!title || !link) continue;
    items.push({
      title,
      url: link,
      source: "",
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      excerpt: description.replace(/<[^>]+>/g, "").slice(0, 240),
    });
  }
  return items;
}

/** Auto-tag tickers mentioned in title + excerpt. Case-sensitive (uppercase). */
function tagTickers(text, tickers) {
  const symbols = tickers.map((t) => t.symbol.toUpperCase());
  const found = new Set();
  for (const s of symbols) {
    const re = new RegExp(`\\b${s.replace(/\./g, "\\.")}\\b`);
    if (re.test(text)) found.add(s);
  }
  return Array.from(found);
}

async function refreshMarket(code) {
  const marketDir = path.join(DATA_ROOT, code);
  const tickersPath = path.join(marketDir, "tickers.json");
  const rssPath = path.join(marketDir, "rss.json");
  const newsPath = path.join(marketDir, "news.json");
  const pricesPath = path.join(marketDir, "prices.json");

  // Skip markets that haven't been seeded yet (no RSS file = nothing to fetch).
  try {
    await readFile(rssPath);
  } catch {
    console.log(`[${code}] skipped (no rss.json yet)`);
    return;
  }

  const [tickers, rssFeeds, existingNews] = await Promise.all([
    loadJson(tickersPath).catch(() => []),
    loadJson(rssPath).catch(() => []),
    loadJson(newsPath).catch(() => []),
  ]);

  const fetched = [];
  for (const feed of rssFeeds) {
    const xml = await fetchText(feed.url);
    if (!xml) continue;
    const items = parseRss(xml).slice(0, 12).map((it) => ({
      ...it,
      source: feed.name,
      tickers: tagTickers(`${it.title} ${it.excerpt ?? ""}`, tickers),
    }));
    fetched.push(...items);
  }

  // Merge: keep existing curated items + dedupe new fetched by URL.
  const seen = new Set();
  const merged = [];
  for (const it of [...fetched, ...existingNews]) {
    if (seen.has(it.url)) continue;
    seen.add(it.url);
    merged.push(it);
  }
  merged.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  merged.length = Math.min(merged.length, 80);

  await writeFile(newsPath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`[${code}] news items: ${merged.length}`);

  // Refresh prices (Yahoo Finance unofficial endpoint, no API key).
  // Bursts in series with a small delay so we don't trip rate limits.
  const prices = {};
  let ok = 0;
  for (const t of tickers) {
    const p = await fetchYahooChart(t.symbol);
    if (p) {
      prices[t.symbol] = p;
      ok++;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  if (ok > 0) {
    await writeFile(pricesPath, JSON.stringify(prices, null, 2) + "\n");
    console.log(`[${code}] prices: ${ok}/${tickers.length}`);
  } else {
    console.log(`[${code}] prices: 0 (Yahoo returned no data — kept existing)`);
  }
}

const markets = await loadJson(MARKETS_FILE);
for (const m of markets) {
  await refreshMarket(m.code);
}
console.log("done");