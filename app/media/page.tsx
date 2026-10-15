import { promises as fs } from "fs";
import path from "path";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MediaClient } from "@/components/MediaClient";
import type { Source } from "@/lib/types";

export const metadata = {
  title: "Media landscape — Publications, Newsletters, Podcasts, YouTube, Instagram",
  description:
    "A curated directory of publications, newsletters, podcasts, YouTube channels, and Instagram accounts that matter for markets and money.",
};

async function loadMediaSources(): Promise<Source[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "data", "media", "sources.json"),
      "utf8"
    );
    return JSON.parse(raw) as Source[];
  } catch {
    return [];
  }
}

export default async function MediaPage() {
  const sources = await loadMediaSources();
  const counts = sources.reduce<Record<string, number>>((acc, s) => {
    acc[s.kind] = (acc[s.kind] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest text-ink-faint">
            The directory
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tightest text-ink text-balance mt-2">
            Media landscape.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-soft text-pretty">
            Curated publications, newsletters, podcasts, YouTube channels, and
            Instagram accounts covering markets, money, and the business of
            business. Hand-picked, not scraped.
          </p>
          {sources.length > 0 && (
            <p className="mt-3 text-xs text-ink-faint ticker">
              {sources.length} sources
              {counts.publication ? ` · ${counts.publication} publications` : ""}
              {counts.newsletter ? ` · ${counts.newsletter} newsletters` : ""}
              {counts.podcast ? ` · ${counts.podcast} podcasts` : ""}
              {counts.youtube ? ` · ${counts.youtube} YouTube` : ""}
              {counts.instagram ? ` · ${counts.instagram} Instagram` : ""}
            </p>
          )}
        </section>

        <MediaClient sources={sources} />
      </main>
      <SiteFooter />
    </>
  );
}