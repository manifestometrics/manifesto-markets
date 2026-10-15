import { notFound } from "next/navigation";
import { getMarket, getMarkets, isMarketCode } from "@/lib/markets";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// Pre-render every market page at build time. New market = add to
// data/markets.json and the route generates automatically.
export async function generateStaticParams() {
  const markets = await getMarkets();
  return markets.map((m) => ({ code: m.code }));
}

export default async function MarketLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { code: string };
}) {
  if (!isMarketCode(params.code)) notFound();
  const market = await getMarket(params.code);
  if (!market) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-widest text-ink-faint">
            {market.region}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-ink mt-1">
            {market.flag} {market.name}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-ink-soft">
            <span>{market.primaryIndex}</span>
            <span className="text-ink-faint">·</span>
            <span className="ticker">{market.currency}</span>
            <span className="text-ink-faint">·</span>
            <span>{market.exchanges.join(" · ")}</span>
          </div>
        </header>

        {/* Each page renders its own MarketNav (with active state). */}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}