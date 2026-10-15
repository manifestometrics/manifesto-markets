export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-faint">
        <p>
          Manifesto Markets — independent directory of stock ideas, writers, and news.
          Not investment advice.
        </p>
        <p className="mt-1">© {new Date().getFullYear()} · Built in the open.</p>
      </div>
    </footer>
  );
}