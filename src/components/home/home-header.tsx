import Link from "next/link";
import { cookies } from "next/headers";
import { Download, Menu } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github-icon";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_LINKS } from "@/lib/site";
import { resolveThemePreference, THEME_COOKIE } from "@/lib/theme";

type SiteHeaderProps = {
  currentPage?: "home" | "download" | "changelog" | "compare" | "guides" | "none";
};

export async function HomeHeader() {
  return <SiteHeader currentPage="home" />;
}

export async function SiteHeader({ currentPage = "home" }: SiteHeaderProps) {
  const cookieStore = await cookies();
  const initialThemePreference = resolveThemePreference(
    cookieStore.get(THEME_COOKIE)?.value,
  );
  const navLinkClass =
    "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-line hover:text-ink";
  const primaryNav = [
    { label: "Compare", href: "/guides/best-yt-dlp-gui-windows", active: currentPage === "compare" },
    { label: "Guides", href: "/guides", active: currentPage === "guides" },
    { label: "Changelog", href: "/changelog", active: currentPage === "changelog" },
  ] as const;

  return (
    <header className="header-bar rounded-2xl px-4 py-2.5 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <Link className="flex items-center gap-2.5" href="/">
          <BrandLogo size={26} />
          <span className="font-display text-[0.9375rem] font-semibold tracking-tight text-ink">
            HalalDL
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${navLinkClass} ${item.active ? "bg-line text-ink" : ""}`.trim()}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeToggle initialPreference={initialThemePreference} />
          </div>
          <a
            href={SITE_LINKS.repoUrl}
            target="_blank"
            rel="noreferrer"
            className={`hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-line hover:text-ink lg:flex`}
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
          <Link
            href="/download"
            aria-label="Download latest release"
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all hover:opacity-90 sm:px-4 ${
              currentPage === "download" ? "bg-paper text-ink" : "glass-cta"
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Link>
        </div>
      </div>

      <details className="group mt-2 md:hidden">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-line bg-paper-strong/70 px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-paper [&::-webkit-details-marker]:hidden">
          <Menu className="h-4 w-4" aria-hidden="true" />
          Menu
        </summary>
        <nav className="mt-2 grid gap-1 rounded-xl border border-line bg-paper-strong/90 p-2" aria-label="Mobile navigation">
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink">
              {item.label}
            </Link>
          ))}
          <Link href="/compare/full-vs-lite" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink">Choose a build</Link>
          <Link href="/install/windows" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink">Install and verify</Link>
          <a href={SITE_LINKS.repoUrl} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper hover:text-ink">GitHub</a>
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-line px-3 pt-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Appearance</span>
            <ThemeToggle initialPreference={initialThemePreference} />
          </div>
        </nav>
      </details>
    </header>
  );
}
