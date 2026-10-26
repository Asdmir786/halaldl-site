import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/home/home-header";
import { HOME_FOOTER_GROUPS } from "@/components/home/home-footer-data";

export function ToolPageShell({
  currentPage,
  title,
  lede,
  children,
}: {
  currentPage: "fetch" | "account" | "legal";
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <main id="main-content" className="secondary-page overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20">
        <SiteHeader currentPage={currentPage} />
        <header className={`mx-auto mt-12 max-w-3xl ${currentPage === "fetch" ? "text-center sm:mt-16" : ""}`}>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-ink">{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">{lede}</p>
        </header>
        <div className="mx-auto mt-8 max-w-3xl">{children}</div>
        <nav aria-label="Footer" className="mt-16 grid gap-6 border-t border-line pt-8 sm:grid-cols-4">
          {HOME_FOOTER_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{group.label}</p>
              <ul className="mt-3 grid gap-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a className="text-sm text-ink-soft hover:text-ink" href={link.href} rel="noreferrer" target="_blank">{link.label}</a>
                    ) : (
                      <Link className="text-sm text-ink-soft hover:text-ink" href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </main>
  );
}
