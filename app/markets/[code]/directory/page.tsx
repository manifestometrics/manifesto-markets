import { notFound } from "next/navigation";
import { getMarket, getSources, isMarketCode } from "@/lib/markets";
import { MarketNav } from "@/components/MarketNav";
import { SourceCard } from "@/components/SourceCard";
import type { Source, SourceKind } from "@/lib/types";

export default async function DirectoryPage({
  params,
}: {
  params: { code: string };
}) {
  if (!isMarketCode(params.code)) notFound();
  const market = await getMarket(params.code);
  if (!market) notFound();

  const sources = await getSources(params.code);
  const byKind = sources.reduce<Record<SourceKind, Source[]>>(
    (acc, s) => {
      acc[s.kind] = acc[s.kind] ?? [];
      acc[s.kind].push(s);
      return acc;
    },
    { x: [], substack: [], newsletter: [], "fund-letter": [], blog: [], podcast: [] }
  );

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

      <section className="mt-8 space-y-10">
        {(Object.entries(byKind) as [SourceKind, Source[]][])
          .filter(([, items]) => items.length > 0)
          .map(([kind, items]) => (
            <div key={kind}>
              <h3 className="font-display text-lg font-medium text-ink">
                {labelForKind(kind)}{" "}
                <span className="ticker text-xs text-ink-faint">
                  ({items.length})
                </span>
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items
                  .sort((a, b) => (b.audience ?? 0) - (a.audience ?? 0))
                  .map((s) => (
                    <SourceCard key={s.id} source={s} />
                  ))}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}

function labelForKind(k: SourceKind): string {
  switch (k) {
    case "x":
      return "X accounts";
    case "substack":
      return "Substack writers";
    case "newsletter":
      return "Newsletters";
    case "fund-letter":
      return "Fund letters";
    case "blog":
      return "Blogs";
    case "podcast":
      return "Podcasts";
  }
}