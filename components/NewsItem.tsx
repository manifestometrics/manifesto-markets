import type { NewsItem } from "@/lib/types";

interface NewsItemProps {
  item: NewsItem;
  showExcerpt?: boolean;
}

export function NewsItemRow({ item, showExcerpt = true }: NewsItemProps) {
  const date = new Date(item.publishedAt);
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="rule py-4 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-medium leading-snug text-ink text-balance">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline decoration-line underline-offset-4"
          >
            {item.title}
          </a>
        </h3>
        <time
          dateTime={item.publishedAt}
          className="ticker shrink-0 text-xs text-ink-faint tabular-nums"
        >
          {dateLabel}
        </time>
      </div>

      <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-soft">
        <span className="font-medium">{item.source}</span>
        {item.sector && (
          <>
            <span className="text-ink-faint">·</span>
            <span>{item.sector}</span>
          </>
        )}
      </div>

      {showExcerpt && item.excerpt && (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft text-pretty">
          {item.excerpt}
        </p>
      )}

      {item.tickers && item.tickers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.tickers.map((t) => (
            <a
              key={t}
              href={`https://finance.yahoo.com/quote/${t}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ticker rounded-sm border border-line px-1.5 py-0.5 text-[10px] tabular-nums text-ink-soft hover:border-ink-soft"
            >
              {t}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}