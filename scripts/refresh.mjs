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
}

const markets = await loadJson(MARKETS_FILE);
for (const m of markets) {
  await refreshMarket(m.code);
}
console.log("done");