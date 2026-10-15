import Link from "next/link";
import { getMarkets } from "@/lib/markets";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default async function HomePage() {
  const markets = await getMarkets();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-12">
          <p className="text-xs uppercase tracking-widest text-ink-faint">
            The directory
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tightest text-ink text-balance mt-2">
            Curated stock ideas, multi-market.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-soft text-pretty">
            Independent writers, fund letters, and the social web — organized
            by market. Not a portfolio tracker. A news outlet for the people
            who actually move money.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-ink mb-4">
            Markets
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map((m) => (
              <Link
                key={m.code}
                href={`/markets/${m.code}`}
                className="group block rounded-md border border-line bg-surface p-5 transition-colors hover:border-ink/30"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-medium text-ink">
                    {m.flag} {m.name}
                  </span>
                  <span className="ticker text-xs text-ink-faint">
                    {m.code.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
                  <span>{m.primaryIndex}</span>
                  <span className="text-ink-faint">·</span>
                  <span className="ticker">{m.currency}</span>
                </div>
                <p className="mt-3 text-xs text-ink-faint">
                  {m.exchanges.join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}