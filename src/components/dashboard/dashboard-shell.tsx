import Link from "next/link";
import { BarChart3, Globe2, LayoutGrid, LibraryBig } from "lucide-react";
import { signOut } from "@/auth";

type DashboardShellProps = {
  children: React.ReactNode;
  currentPage: "overview" | "acquisition" | "releases";
  generatedAt?: string;
  title?: string;
  description?: string;
};

const navItems = [
  { href: "/dashboard", label: "Overview", value: "overview", icon: LayoutGrid },
  { href: "/dashboard/acquisition", label: "Acquisition", value: "acquisition", icon: Globe2 },
  { href: "/dashboard/releases", label: "Releases", value: "releases", icon: LibraryBig },
] as const;

export function DashboardShell({
  children,
  currentPage,
  generatedAt,
  title = "HalalDL growth dashboard",
  description = "One private view for traffic, page attention, referrers, download interest, and whether people reach the download section without taking the next step.",
}: DashboardShellProps) {
  return (
    <main
      id="main-content"
      className="overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(90,157,255,0.11),transparent_26%),linear-gradient(180deg,#0b1220_0%,#0f1726_55%,#11192c_100%)] text-paper"
    >
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/6 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/85">
                <BarChart3 className="h-3.5 w-3.5" />
                Internal analytics
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {description}
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/dashboard/login" });
              }}
            >
              <button
                type="submit"
                className="inline-flex rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/12"
              >
                Log out
              </button>
            </form>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.value === currentPage;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-sky-300/40 bg-sky-300/16 text-white"
                      : "border-white/10 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {generatedAt && (
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              Last 30 days · Updated {new Date(generatedAt).toLocaleString("en-US")}
            </p>
          )}
        </section>

        {children}
      </div>
    </main>
  );
}
