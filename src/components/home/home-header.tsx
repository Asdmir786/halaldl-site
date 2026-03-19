import Image from "next/image";
import Link from "next/link";
import { Download, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_LINKS } from "@/lib/site";

export function HomeHeader() {
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
            href="/changelog"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-line hover:text-ink"
          >
            Changelog
          </Link>
          {["Features", "Install", "Trust", "FAQ"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-line hover:text-ink"
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
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-line hover:text-ink lg:flex"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <a
            href="/download"
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper transition-all hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>
    </header>
  );
}
