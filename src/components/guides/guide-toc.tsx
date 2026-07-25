"use client";

type TocItem = {
  id: string;
  text: string;
};

export function GuideToc({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="surface-elevated sticky top-28 hidden rounded-2xl p-4 xl:block"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        On this page
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
