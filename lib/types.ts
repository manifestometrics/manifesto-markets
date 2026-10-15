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
}

export type SourceKind =
  | "x"
  | "substack"
  | "newsletter"
  | "fund-letter"
  | "blog"
  | "podcast";

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