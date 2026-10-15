import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getMarket,
  getTickers,
  getNews,
  getPrices,
  isMarketCode,
} from "@/lib/markets";
import { TickerCard } from "@/components/TickerCard";
import { NewsItemRow } from "@/components/NewsItem";
import { MarketNav } from "@/components/MarketNav";

// Mock prices used as a fallback when prices.json hasn't been generated
// yet for a ticker. Once the daily cron has run, real Yahoo quotes take over.
const MOCK_PRICES: Record<string, { price: number; changePct: number }> = {
  NVDA: { price: 478.32, changePct: 2.14 },
  AAPL: { price: 226.55, changePct: -0.42 },
  MSFT: { price: 432.18, changePct: 0.91 },
  GOOGL: { price: 178.4, changePct: 1.32 },
  AMZN: { price: 191.27, changePct: 0.55 },
  META: { price: 562.04, changePct: -1.07 },
  TSLA: { price: 251.6, changePct: 3.21 },
  "BRK-B": { price: 462.18, changePct: 0.18 },
  JPM: { price: 218.94, changePct: 0.62 },
  XOM: { price: 117.45, changePct: -0.84 },
  CRWD: { price: 384.21, changePct: 4.91 },
  SNOW: { price: 156.78, changePct: 1.74 },
  PLTR: { price: 71.32, changePct: 6.18 },
  COST: { price: 902.55, changePct: 0.34 },
  OXY: { price: 62.91, changePct: -0.12 },
};

export default async function MarketHomePage({
  params,
}: {
  params: { code: string };
}) {
  if (!isMarketCode(params.code)) notFound();
  const market = await getMarket(params.code);
  if (!market) notFound();

  const tickers = await getTickers(params.code);
  const news = await getNews(params.code);
  const prices = await getPrices(params.code);
  const topPicks = tickers.slice(0, 10);

  // Find the most recent asOf timestamp across all prices for the freshness chip.
  const asOfList = Object.values(prices)
    .map((p) => p.asOf)
    .filter(Boolean)
    .sort();
  const lastUpdated = asOfList.at(-1);

  return (
    <div>
      <MarketNav market={market} active="home" />

      {/* Index snapshot strip */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: market.primaryIndex, value: "—", change: "+0.00%" },
          { label: "Volatility", value: "—", change: "—" },
          { label: "10Y", value: "—", change: "—" },
          { label: "USD Index", value: "—", change: "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-line bg-surface p-4"
          >
            <p className="text-[10px] uppercase tracking-widest text-ink-faint">
              {s.label}
            </p>
            <p className="ticker mt-1 text-xl font-medium tabular-nums text-ink">
              {s.value}
            </p>
            <p className="ticker mt-1 text-xs tabular-nums text-ink-soft">
              {s.change}
            </p>
          </div>
        ))}
      </section>

      {/* Curated top picks */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-medium text-ink">
            Curated top picks
          </h2>
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span>{tickers.length} in the directory</span>
            {lastUpdated && (
              <span className="ticker tabular-nums">
                · prices as of{" "}
                {new Date(lastUpdated).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {topPicks.map((t) => {
            const live = prices[t.symbol];
            const mock = MOCK_PRICES[t.symbol] ?? { price: 100, changePct: 0 };
            return (
              <TickerCard
                key={t.symbol}
                ticker={t}
                price={live?.price ?? mock.price}
                changePct={live?.changePct ?? mock.changePct}
                series={live?.series}
              />
            );
          })}
        </div>
      </section>

      {/* Latest news strip */}
      <section className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-medium text-ink">
              Latest from {market.name}
            </h2>
            <Link
              href={`/markets/${market.code}/news`}
              className="text-xs text-ink-soft source-link"
            >
              All news →
            </Link>
          </div>
          <div className="mt-4">
            {news.slice(0, 5).map((n) => (
              <NewsItemRow key={n.id} item={n} />
            ))}
            {news.length === 0 && (
              <p className="text-sm text-ink-faint">
                No news yet — the daily refresh has not run.
              </p>
            )}
          </div>
        </div>

        <aside>
          <h3 className="font-display text-lg font-medium text-ink">
            Where to look
          </h3>
          <p className="mt-2 text-sm text-ink-soft leading-relaxed">
            The directory page collects X handles, Substack writers, and fund
            letters covering this market.
          </p>
          <Link
            href={`/markets/${market.code}/directory`}
            className="mt-4 inline-flex items-center text-sm text-ink source-link"
          >
            Open the directory →
          </Link>
        </aside>
      </section>
    </div>
  );
}