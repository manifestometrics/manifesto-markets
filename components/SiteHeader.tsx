import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Manifesto<span className="text-ink-soft"> Markets</span>
          </span>
          <span className="hidden md:inline text-xs text-ink-faint">
            — curated stock ideas, multi-market
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-xs text-ink-faint">
          <Link href="/media" className="source-link">
            Media
          </Link>
          <Link href="/about" className="source-link">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}