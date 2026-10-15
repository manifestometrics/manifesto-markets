"use client";

import { useMemo, useState } from "react";
import type { Source, SourceKind } from "@/lib/types";
import { SourceCard } from "@/components/SourceCard";
import { FilterChip } from "@/components/FilterChip";

interface DirectoryClientProps {
  sources: Source[];
}

const KIND_ORDER: SourceKind[] = [
  "x",
  "substack",
  "newsletter",
  "news",
  "fund-letter",
  "blog",
  "podcast",
];

const KIND_LABEL: Record<SourceKind, string> = {
  x: "X",
  substack: "Substack",
  newsletter: "Newsletter",
  "fund-letter": "Fund Letter",
  blog: "Blog",
  podcast: "Podcast",
  news: "Newsroom",
  publication: "Publication",
  youtube: "YouTube",
  instagram: "Instagram",
};

const KIND_GROUP_LABEL: Record<SourceKind, string> = {
  x: "X accounts",
  substack: "Substack writers",
  newsletter: "Newsletters",
  "fund-letter": "Fund letters",
  blog: "Blogs",
  podcast: "Podcasts",
  news: "Newsrooms",
  publication: "Publications",
  youtube: "YouTube channels",
  instagram: "Instagram accounts",
};

const TOP_TAG_LIMIT = 12;
const ALL = "all";

type KindFilter = typeof ALL | SourceKind;
type TagFilter = string; // tag name or ALL

export function DirectoryClient({ sources }: DirectoryClientProps) {
  const [kindFilter, setKindFilter] = useState<KindFilter>(ALL);
  const [tagFilter, setTagFilter] = useState<TagFilter>(ALL);

  // Per-kind counts always reflect the unfiltered set so the chips stay
  // stable as the user toggles filters.
  const kindCounts = useMemo(() => {
    const counts: Record<SourceKind, number> = {
      x: 0,
      substack: 0,
      newsletter: 0,
      "fund-letter": 0,
      blog: 0,
      podcast: 0,
      news: 0,
      publication: 0,
      youtube: 0,
      instagram: 0,
    };
    for (const s of sources) counts[s.kind] += 1;
    return counts;
  }, [sources]);

  // Top N focus tags across the full set — pre-computed once.
  const topTags = useMemo(() => {
    const tally = new Map<string, number>();
    for (const s of sources) {
      for (const t of s.focus ?? []) {
        tally.set(t, (tally.get(t) ?? 0) + 1);
      }
    }
    return Array.from(tally.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, TOP_TAG_LIMIT)
      .map(([tag]) => tag);
  }, [sources]);

  const filtered = useMemo(() => {
    return sources.filter((s) => {
      if (kindFilter !== ALL && s.kind !== kindFilter) return false;
      if (tagFilter !== ALL && !(s.focus ?? []).includes(tagFilter))
        return false;
      return true;
    });
  }, [sources, kindFilter, tagFilter]);

  const byKind = useMemo(() => {
    const groups: Record<SourceKind, Source[]> = {
      x: [],
      substack: [],
      newsletter: [],
      "fund-letter": [],
      blog: [],
      podcast: [],
      news: [],
      publication: [],
      youtube: [],
      instagram: [],
    };
    for (const s of filtered) groups[s.kind].push(s);
    return groups;
  }, [filtered]);

  const visibleKindSections = KIND_ORDER.filter(
    (k) => byKind[k].length > 0
  );

  const filtersActive = kindFilter !== ALL || tagFilter !== ALL;

  function clearAll() {
    setKindFilter(ALL);
    setTagFilter(ALL);
  }

  return (
    <>
      <section
        aria-label="Filter sources"
        className="mt-8 space-y-4 rounded-md border border-line bg-surface p-4"
      >
        {/* Kind chips */}
        <div>
          <div className="ticker text-[10px] uppercase tracking-widest text-ink-faint">
            Source kind
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <FilterChip
              active={kindFilter === ALL}
              onClick={() => setKindFilter(ALL)}
            >
              All <span className="ticker text-[10px] opacity-70">({sources.length})</span>
            </FilterChip>
            {KIND_ORDER.map((k) =>
              kindCounts[k] === 0 ? null : (
                <FilterChip
                  key={k}
                  active={kindFilter === k}
                  onClick={() =>
                    setKindFilter((prev) => (prev === k ? ALL : k))
                  }
                >
                  {KIND_LABEL[k]}{" "}
                  <span className="ticker text-[10px] opacity-70">
                    ({kindCounts[k]})
                  </span>
                </FilterChip>
              )
            )}
          </div>
        </div>

        {/* Tag chips */}
        {topTags.length > 0 && (
          <div>
            <div className="ticker text-[10px] uppercase tracking-widest text-ink-faint">
              Topic
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterChip
                active={tagFilter === ALL}
                onClick={() => setTagFilter(ALL)}
              >
                All topics
              </FilterChip>
              {topTags.map((tag) => (
                <FilterChip
                  key={tag}
                  active={tagFilter === tag}
                  onClick={() =>
                    setTagFilter((prev) => (prev === tag ? ALL : tag))
                  }
                >
                  {tag}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        {/* Result line */}
        <div className="flex items-center justify-between border-t border-line-soft pt-3">
          <p className="ticker text-xs text-ink-faint">
            Showing{" "}
            <span className="text-ink tabular-nums">{filtered.length}</span> of{" "}
            <span className="text-ink tabular-nums">{sources.length}</span>{" "}
            sources
            {filtersActive ? (
              <>
                {" "}
                ·{" "}
                <button
                  type="button"
                  onClick={clearAll}
                  className="underline-offset-2 hover:underline"
                >
                  Clear filters
                </button>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="mt-8 space-y-10">
        {visibleKindSections.length === 0 ? (
          <div className="rounded-md border border-dashed border-line p-8 text-center text-sm text-ink-soft">
            No sources match the current filters.{" "}
            <button
              type="button"
              onClick={clearAll}
              className="text-ink underline underline-offset-2 hover:no-underline"
            >
              Clear filters
            </button>
            .
          </div>
        ) : (
          visibleKindSections.map((kind) => {
            const items = byKind[kind];
            return (
              <div key={kind}>
                <h3 className="font-display text-lg font-medium text-ink">
                  {KIND_GROUP_LABEL[kind]}{" "}
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
            );
          })
        )}
      </section>
    </>
  );
}
