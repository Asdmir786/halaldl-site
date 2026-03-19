import Image from "next/image";
import Link from "next/link";
import { Download, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_LINKS } from "@/lib/site";

type SiteHeaderProps = {
  currentPage?: "home" | "download" | "changelog";
};

export function HomeHeader() {
  return <SiteHeader currentPage="home" />;
}

export function SiteHeader({ currentPage = "home" }: SiteHeaderProps) {
  const navItems = ["Features", "Install", "Trust", "FAQ"] as const;
  const homeSectionHref = (item: (typeof navItems)[number]) =>
    currentPage === "home" ? `#${item.toLowerCase()}` : `/#${item.toLowerCase()}`;
  const navLinkClass =
    "rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-line hover:text-ink";
  const mobileNavLinkClass =
    "shrink-0 rounded-full border border-line bg-paper-strong/70 px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper hover:text-ink";

  return (
    <header className="header-bar sticky top-3 z-40 rounded-2xl px-4 py-2.5 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <Link className="flex items-center gap-2.5" href="/">
          <Image src="/brand/icon.png" alt="HalalDL" width={26} height={26} className="rounded" />
          <span className="font-display text-[0.9375rem] font-semibold tracking-tight text-ink">
            HalalDL
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Link
            href="/"
            className={`${navLinkClass} ${currentPage === "home" ? "bg-line text-ink" : ""}`.trim()}
          >
            Home
          </Link>
          <Link
            href="/changelog"
            className={`${navLinkClass} ${currentPage === "changelog" ? "bg-line text-ink" : ""}`.trim()}
          >
            Changelog
          </Link>
          {navItems.map((item) => (
            <a
              key={item}
              href={homeSectionHref(item)}
              className={navLinkClass}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={SITE_LINKS.repoUrl}
            target="_blank"
            rel="noreferrer"
            className={`hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-line hover:text-ink lg:flex`}
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <a
            href="/download"
            aria-label="Download latest release"
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all hover:opacity-90 sm:px-4 ${
              currentPage === "download" ? "bg-paper text-ink" : "bg-ink text-paper"
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </a>
        </div>
      </div>

      <nav
        className="-mx-1 mt-3 flex flex-wrap gap-2 px-1 pb-1 md:hidden"
        aria-label="Mobile navigation"
      >
        <Link
          href="/"
          className={`${mobileNavLinkClass} ${currentPage === "home" ? "bg-paper text-ink" : ""}`.trim()}
        >
          Home
        </Link>
        <Link
          href="/changelog"
          className={`${mobileNavLinkClass} ${currentPage === "changelog" ? "bg-paper text-ink" : ""}`.trim()}
        >
          Changelog
        </Link>
        {navItems.map((item) => (
          <a
            key={item}
            href={homeSectionHref(item)}
            className={mobileNavLinkClass}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
