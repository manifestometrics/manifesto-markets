import type { Ticker } from "@/lib/types";
import { Sparkline } from "./Sparkline";

interface TickerCardProps {
  ticker: Ticker;
  /** Mock or live price; the data pipeline replaces this in production. */
  price: number;
  changePct: number;
  /** 30-day sparkline series */
  series?: Array<{ time: string; value: number }>;
}

export function TickerCard({ ticker, price, changePct, series }: TickerCardProps) {
  const tone = changePct > 0 ? "up" : changePct < 0 ? "down" : "neutral";
  const sign = changePct > 0 ? "+" : "";

  return (
    <a
      href={`https://finance.yahoo.com/quote/${ticker.symbol}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-md border border-line bg-surface p-4 transition-colors hover:border-ink/30"
    >
      <div className="flex items-baseline justify-between">
        <span className="ticker text-base font-semibold tracking-tight text-ink">
          {ticker.symbol}
        </span>
        <span
          className={`ticker text-xs font-medium tabular-nums ${
            tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-ink-soft"
          }`}
        >
          {sign}
          {changePct.toFixed(2)}%
        </span>
      </div>

      <div className="mt-1 text-xs text-ink-soft line-clamp-1">{ticker.name}</div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="ticker text-lg font-medium tabular-nums text-ink">
          {price.toFixed(2)}
        </span>
        <div className="-mb-1 h-11 w-24 opacity-90 group-hover:opacity-100">
          {series && series.length > 0 && (
            <Sparkline data={series} tone={tone} height={44} />
          )}
        </div>
      </div>

      {ticker.themes && ticker.themes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {ticker.themes.map((t) => (
            <span
              key={t}
              className="rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}