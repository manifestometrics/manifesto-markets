import { promises as fs } from "fs";
import path from "path";
import type { Market, MarketCode, Source, Ticker, NewsItem } from "./types";

// The market registry is the single source of truth for which markets exist
// and how to resolve their per-market data files. Adding a new market = 
// appending to markets.json and dropping JSON files into data/<code>/.

const DATA_ROOT = path.join(process.cwd(), "data");

let _marketsCache: Market[] | null = null;

export async function getMarkets(): Promise<Market[]> {
  if (_marketsCache) return _marketsCache;
  const raw = await fs.readFile(path.join(DATA_ROOT, "markets.json"), "utf8");
  _marketsCache = JSON.parse(raw) as Market[];
  return _marketsCache;
}

export async function getMarket(code: MarketCode): Promise<Market | null> {
  const markets = await getMarkets();
  return markets.find((m) => m.code === code) ?? null;
}

export async function getTickers(code: MarketCode): Promise<Ticker[]> {
  try {
    const raw = await fs.readFile(
      path.join(DATA_ROOT, code, "tickers.json"),
      "utf8"
    );
    return JSON.parse(raw) as Ticker[];
  } catch {
    return [];
  }
}

export async function getSources(code: MarketCode): Promise<Source[]> {
  try {
    const raw = await fs.readFile(
      path.join(DATA_ROOT, code, "sources.json"),
      "utf8"
    );
    return JSON.parse(raw) as Source[];
  } catch {
    return [];
  }
}

export async function getNews(code: MarketCode): Promise<NewsItem[]> {
  try {
    const raw = await fs.readFile(
      path.join(DATA_ROOT, code, "news.json"),
      "utf8"
    );
    return JSON.parse(raw) as NewsItem[];
  } catch {
    return [];
  }
}

export function isMarketCode(value: string): value is MarketCode {
  return ["us", "jp", "kr", "de", "my"].includes(value);
}