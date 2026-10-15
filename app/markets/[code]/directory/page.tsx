import { notFound } from "next/navigation";
import { getMarket, getSources, isMarketCode } from "@/lib/markets";
import { MarketNav } from "@/components/MarketNav";
import { DirectoryClient } from "@/components/DirectoryClient";

export default async function DirectoryPage({
  params,
}: {
  params: { code: string };
}) {
  if (!isMarketCode(params.code)) notFound();
  const market = await getMarket(params.code);
  if (!market) notFound();

  const sources = await getSources(params.code);

  return (
    <div>
      <MarketNav market={market} active="directory" />

      <section className="mt-6">
        <h2 className="font-display text-2xl font-medium text-ink">
          Directory of writers & sources
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Hand-picked sources covering {market.name}. Click through to read.
          Curated, not scraped.
        </p>
      </section>

      <DirectoryClient sources={sources} />
    </div>
  );
}
