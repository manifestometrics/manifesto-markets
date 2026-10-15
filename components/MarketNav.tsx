import Link from "next/link";
import type { Market } from "@/lib/types";

interface MarketNavProps {
  market: Market;
  active?: "home" | "directory" | "news";
}

export function MarketNav({ market, active = "home" }: MarketNavProps) {
  const items: Array<{ key: "home" | "directory" | "news"; label: string; href: string }> = [
    { key: "home", label: "Overview", href: `/markets/${market.code}` },
    {
      key: "directory",
      label: "Directory",
      href: `/markets/${market.code}/directory`,
    },
    { key: "news", label: "News", href: `/markets/${market.code}/news` },
  ];

  return (
    <nav className="rule flex items-center gap-6 overflow-x-auto text-sm">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`-mb-px border-b py-3 ${
              isActive
                ? "border-ink text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}