import { notFound } from "next/navigation";
import { getMarket, getNews, isMarketCode } from "@/lib/markets";
import { MarketNav } from "@/components/MarketNav";
import { NewsItemRow } from "@/components/NewsItem";

export default async function NewsPage({
  params,
}: {
  params: { code: string };
}) {
  if (!isMarketCode(params.code)) notFound();
  const market = await getMarket(params.code);
  if (!market) notFound();

  const news = await getNews(params.code);

  return (
    <div>
      <MarketNav market={market} active="news" />

      <section className="mt-6">
        <h2 className="font-display text-2xl font-medium text-ink">
          News & events
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Auto-aggregated from RSS feeds. Tickers tagged by the data pipeline.
        </p>
      </section>

      <section className="mt-8 max-w-3xl">
        {news.map((n) => (
          <NewsItemRow key={n.id} item={n} />
        ))}
        {news.length === 0 && (
          <p className="text-sm text-ink-faint">No news yet.</p>
        )}
      </section>
    </div>
  );
}