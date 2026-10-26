import Link from "next/link";
import { cookies } from "next/headers";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { resolveThemePreference, THEME_COOKIE } from "@/lib/theme";

type SiteHeaderProps = {
  currentPage?: "home" | "download" | "changelog" | "compare" | "guides" | "fetch" | "account" | "legal" | "none";
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
    { label: "Online downloader", href: "/fetch", active: currentPage === "fetch" },
    { label: "Guides", href: "/guides", active: currentPage === "guides" },
    { label: "Windows app", href: "/download", active: currentPage === "download" },
  ];
  return (
    <header className="header-bar relative z-20 flex min-h-16 items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-6">
      <Link className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint-strong" href="/" aria-label="HalalDL home">
        <BrandLogo size={28} />
        <span className="font-display text-base font-semibold tracking-tight text-ink">HalalDL</span>
      </Link>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
        {primaryNav.map(item => <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className={`${navLinkClass} focus-visible:outline-2 focus-visible:outline-mint-strong ${item.active ? "bg-line text-ink" : ""}`}>{item.label}</Link>)}
      </nav>
      <div className="hidden md:block"><ThemeToggle initialPreference={initialThemePreference} /></div>
      <details className="group md:hidden">
        <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-line px-3 text-ink focus-visible:outline-2 focus-visible:outline-mint-strong [&::-webkit-details-marker]:hidden" aria-label="Navigation menu"><Menu className="h-5 w-5" aria-hidden="true" /></summary>
        <nav className="absolute inset-x-0 top-full mt-2 grid gap-1 rounded-2xl border border-line bg-paper-strong p-3 shadow-xl" aria-label="Mobile navigation">
          {primaryNav.map(item => <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-line">{item.label}</Link>)}
          <Link href="/account" className="rounded-lg px-3 py-3 text-sm text-ink">Free account</Link>
          <div className="flex items-center justify-between border-t border-line px-3 pt-3"><span className="text-sm text-ink-soft">Appearance</span><ThemeToggle initialPreference={initialThemePreference} /></div>
        </nav>
      </details>
    </header>
  );
}
