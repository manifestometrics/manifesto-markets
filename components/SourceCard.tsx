import type { Source } from "@/lib/types";

interface SourceCardProps {
  source: Source;
}

const KIND_LABEL: Record<Source["kind"], string> = {
  x: "X",
  substack: "Substack",
  newsletter: "Newsletter",
  "fund-letter": "Fund Letter",
  blog: "Blog",
  podcast: "Podcast",
};

function formatAudience(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function SourceCard({ source }: SourceCardProps) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-md border border-line bg-surface p-4 transition-colors hover:border-ink/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-medium text-ink truncate">
              {source.name}
            </h3>
            <span className="rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-faint">
              {KIND_LABEL[source.kind]}
            </span>
          </div>
          {source.handle && (
            <p className="ticker text-xs text-ink-soft mt-0.5">{source.handle}</p>
          )}
        </div>
        {source.audience && source.audience > 0 && (
          <span className="ticker text-xs text-ink-faint tabular-nums">
            {formatAudience(source.audience)}
          </span>
        )}
      </div>

      {source.bio && (
        <p className="mt-2 text-xs leading-relaxed text-ink-soft line-clamp-2">
          {source.bio}
        </p>
      )}

      {source.focus && source.focus.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {source.focus.map((f) => (
            <span
              key={f}
              className="rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft"
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}