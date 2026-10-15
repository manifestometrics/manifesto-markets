// Manifesto Markets — type definitions for the multi-market directory

export type MarketCode = "us" | "jp" | "kr" | "de" | "my";

export interface Market {
  code: MarketCode;
  name: string;
  region: string;
  flag: string;
  primaryIndex: string;
  currency: string;
  exchanges: string[];
  defaultSource: "yahoo" | "stooq" | "manual";
}

export interface Ticker {
  symbol: string;
  name: string;
  sector?: string;
  themes?: string[];
  /** ISO date when this ticker was added to the curated set */
  addedAt?: string;
  /** Optional: writer or source that originally pitched this ticker */
  pitchedBy?: string;
  /** Optional: enriched one-paragraph description shown on market cards. */
  description?: string;
}

export type SourceKind =
  | "x"
  | "substack"
  | "newsletter"
  | "fund-letter"
  | "blog"
  | "podcast"
  | "news"
  | "publication"
  | "youtube"
  | "instagram";

export interface Source {
  id: string;
  name: string;
  handle?: string;            // X handle without @
  kind: SourceKind;
  url: string;
  /** Free-text specialty tags — sector, market cap focus, style */
  focus?: string[];
  /** Approximate follower/subscriber count for ranking */
  audience?: number;
  /** ISO date the source was added */
  addedAt?: string;
  bio?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;            // publication name
  sourceUrl?: string;
  publishedAt: string;       // ISO date
  /** Tickers auto-tagged by the data pipeline */
  tickers?: string[];
  sector?: string;
  excerpt?: string;
}

export interface MarketEvent {
  id: string;
  date: string;              // ISO date
  type: "earnings" | "ipo" | "macro" | "fed" | "holiday";
  title: string;
  tickers: string[];
  importance: "low" | "med" | "high";
}

export interface PriceQuote {
  price: number;
  change: number;
  changePct: number;
  currency: string;
  asOf: string;              // ISO datetime when the quote was fetched
  series: Array<{ time: string; value: number }>;
}

export type PriceBook = Record<string, PriceQuote>;

export type IndexSymbolId = "^GSPC" | "^IXIC" | "^TNX" | "DX-Y.NYB";

export interface IndexQuote {
  /** Display label for the strip tile (e.g. "S&P 500", "10Y"). */
  label: string;
  /** "decimal" for indices shown as raw price (7,724.58);
   *  "percent" for the 10Y yield shown as 4.32%. */
  format: "decimal" | "percent";
  price: number;
  change: number;
  changePct: number;
  asOf: string;
}

export type IndexBook = Partial<Record<IndexSymbolId, IndexQuote>>;