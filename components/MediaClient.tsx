"use client";

import { useMemo, useState } from "react";
import type { Source, SourceKind } from "@/lib/types";
import { SourceCard } from "@/components/SourceCard";
import { FilterChip } from "@/components/FilterChip";

interface MediaClientProps {
  sources: Source[];
}

const KIND_ORDER: SourceKind[] = [
  "publication",
  "newsletter",
  "podcast",
  "youtube",
  "instagram",
];

const KIND_LABEL: Record<SourceKind, string> = {
  publication: "Publication",
  newsletter: "Newsletter",
  podcast: "Podcast",
  youtube: "YouTube",
  instagram: "Instagram",
  // Other kinds (not used in this client but typed for completeness):
  x: "X",
  substack: "Substack",
  "fund-letter": "Fund Letter",
  blog: "Blog",
  news: "Newsroom",
};

const TOP_TAG_LIMIT = 16;
const ALL = "all";

export function MediaClient({ sources }: MediaClientProps) {
  const [kindFilter, setKindFilter] = useState<SourceKind | typeof ALL>(ALL);
  const [tagFilter, setTagFilter] = useState<string>(ALL);

  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sources) {
      for (const t of s.focus ?? []) {
        counts[t] = (counts[t] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_TAG_LIMIT)
      .map(([t]) => t);
  }, [sources]);

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

  const filtered = useMemo(() => {
    return sources.filter((s) => {
      if (kindFilter !== ALL && s.kind !== kindFilter) return false;
      if (tagFilter !== ALL && !(s.focus ?? []).includes(tagFilter)) return false;
      return true;
    });
  }, [sources, kindFilter, tagFilter]);

  // Group filtered by kind, in KIND_ORDER. Hide empty sections.
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

  const filtersActive = kindFilter !== ALL || tagFilter !== ALL;

  function clearAll() {
    setKindFilter(ALL);
    setTagFilter(ALL);
  }

  return (
    <div className="mt-8">
      {/* Filter chip panels */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-ink-faint mr-1">
            Format
          </span>
          <FilterChip
            active={kindFilter === ALL}
            onClick={() => setKindFilter(ALL)}
          >
            All
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
                <span className="text-ink-faint">({kindCounts[k]})</span>
              </FilterChip>
            )
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-ink-faint mr-1">
            Topic
          </span>
          <FilterChip
            active={tagFilter === ALL}
            onClick={() => setTagFilter(ALL)}
          >
            All
          </FilterChip>
          {allTags.map((t) => (
            <FilterChip
              key={t}
              active={tagFilter === t}
              onClick={() => setTagFilter((prev) => (prev === t ? ALL : t))}
            >
              {t}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Status line */}
      <div className="mt-4 flex items-center justify-between text-xs text-ink-faint">
        <span className="ticker tabular-nums">
          Showing {filtered.length} of {sources.length}
        </span>
        {filtersActive && (
          <button
            onClick={clearAll}
            className="text-ink-soft source-link"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grouped sections */}
      <div className="mt-6 space-y-10">
        {KIND_ORDER.filter((k) => byKind[k].length > 0).map((k) => (
          <div key={k}>
            <h3 className="font-display text-lg font-medium text-ink">
              {KIND_LABEL[k]}s{" "}
              <span className="ticker text-xs text-ink-faint">
                ({byKind[k].length})
              </span>
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {byKind[k]
                .sort((a, b) => (b.audience ?? 0) - (a.audience ?? 0))
                .map((s) => (
                  <SourceCard key={s.id} source={s} />
                ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-md border border-line bg-surface p-8 text-center">
            <p className="text-sm text-ink-soft">
              No matches. Try clearing filters.
            </p>
            <button
              onClick={clearAll}
              className="mt-3 text-sm text-ink source-link"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}