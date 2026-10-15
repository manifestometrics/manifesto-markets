# Manifesto Markets

A curated multi-market directory of stock ideas, writers, and news.

Editorial news outlet for the people who move money. Not a portfolio tracker.

## Inspiration

Closest peers in spirit:

- [Bullpen.news](https://bullpen.news/) — curated directory of stock ideas (newsletters, X, fund letters)
- [Yellowbrick](https://www.joinyellowbrick.com/discover) — 35k+ pitches, performance attribution
- [RhinoInvestory](https://rhinoinvestory.com) — country filter, 40+ countries
- [HFBestIdeas](https://hfbestideas.com) — hedge fund letters, 53 countries
- [Finobird](https://finobird.com) — multi-asset news aggregator

## Architecture

Per-market landing pages, driven by JSON config in `data/`. Adding a new market = two steps:

1. Append to `data/markets.json`
2. Drop JSON files in `data/<code>/` (tickers.json, sources.json, rss.json)

The daily GitHub Actions cron (`refresh-data.yml`) re-reads the RSS feeds in `rss.json`, auto-tags tickers, and commits a refreshed `news.json` to `main`. Vercel rebuilds on push.

```
app/
  page.tsx                          # market selector (root)
  markets/[code]/
    layout.tsx                      # per-market shell
    page.tsx                        # home: index snapshot + top picks + news
    directory/page.tsx              # sources directory
    news/page.tsx                   # news + events
components/
  SiteHeader.tsx, SiteFooter.tsx
  MarketNav.tsx                     # sub-nav (Overview / Directory / News)
  TickerCard.tsx, SourceCard.tsx, NewsItem.tsx
  Sparkline.tsx                     # lightweight-charts client component
data/
  markets.json                      # registry of all markets
  us/
    tickers.json                    # curated US tickers (start with 15)
    sources.json                    # curated X / Substack / fund letters (~30)
    rss.json                        # RSS feeds aggregated by cron
    news.json                       # daily-refreshed news with auto-tickers
scripts/
  refresh.mjs                       # daily cron: RSS → tagged news.json
.github/workflows/
  refresh-data.yml                  # 13:00 UTC daily
```

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS for styling
- TradingView Lightweight Charts for sparklines
- Static deploy, no backend — data refresh happens in CI, then commits land

## Per-market template

To add a new market (e.g. JP, KR, DE, MY):

1. Add to `data/markets.json`
2. Create `data/<code>/tickers.json` (curated top picks)
3. Create `data/<code>/sources.json` (curated writers — 30–50 entries)
4. Create `data/<code>/rss.json` (RSS feeds that cover this market)
5. Optional: seed `data/<code>/news.json` with placeholders

The site auto-builds the page at `/markets/<code>`.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Deploy

Vercel — connected via the dashboard. Push to `main` and the affected routes rebuild. Domain: TBD.

## Curation policy

- Sources are hand-picked, not scraped.
- We do not auto-claim performance attribution in MVP.
- Each source lists its kind, focus tags, and a short bio.

## Roadmap

- [ ] Live prices (replace `MOCK_PRICES` in `app/markets/[code]/page.tsx`)
- [ ] Filter chips on the directory (sector, source kind, region)
- [ ] Daily email recap (Resend or similar)
- [ ] X handle ingestion (recent posts per source)
- [ ] Additional markets: JP, KR, DE, MY
- [ ] OG image generation per market