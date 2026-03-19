import Link from "next/link";

type SubpageRouteStripProps = {
  currentPage: "download" | "changelog" | "compare" | "install" | "trust";
};

const items = [
  { id: "download", label: "Download", href: "/download" },
  { id: "changelog", label: "Changelog", href: "/changelog" },
  { id: "compare", label: "Full vs Lite", href: "/compare/full-vs-lite" },
  { id: "install", label: "Install on Windows", href: "/install/windows" },
  { id: "trust", label: "Verify SHA256", href: "/trust/verify-checksum" },
] as const;

export function SubpageRouteStrip({ currentPage }: SubpageRouteStripProps) {
  return (
    <nav
      aria-label="Subpage navigation"
      className="mt-5 flex flex-wrap gap-2"
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
            item.id === currentPage
              ? "border-line-strong bg-paper text-ink"
              : "border-line bg-paper-strong/70 text-ink-soft hover:bg-paper hover:text-ink"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
