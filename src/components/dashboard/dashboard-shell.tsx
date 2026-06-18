import Link from "next/link";
import { BarChart3, Compass, Globe2, LayoutGrid, LibraryBig } from "lucide-react";
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
      className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(90,157,255,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(52,167,123,0.09),transparent_22%),linear-gradient(180deg,#07101c_0%,#0b1422_48%,#111a2c_100%)] text-paper"
    >
      <div className="mx-auto max-w-[1500px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,38,0.92),rgba(10,17,29,0.92))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-300/14 text-sky-100">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">Private view</p>
                  <p className="font-display text-xl font-semibold text-white">HalalDL Ops</p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-white/6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">What this is</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  One owner-only command center for traffic, acquisition, and release demand.
                </p>
              </div>

              <nav className="mt-6 grid gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.value === currentPage;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                        active
                          ? "border-sky-300/35 bg-sky-300/16 text-white shadow-[0_0_0_1px_rgba(125,211,252,0.08)]"
                          : "border-white/8 bg-white/5 text-slate-300 hover:border-white/12 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-sky-300/16 text-sky-100" : "bg-white/6 text-slate-400 group-hover:text-white"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Compass className="h-4 w-4 text-sky-100" />
                  <span className="text-sm font-semibold">Window</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Last 30 days</p>
                {generatedAt ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                    Updated {new Date(generatedAt).toLocaleString("en-US")}
                  </p>
                ) : null}
              </div>

              <form
                className="mt-6"
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/dashboard/login" });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/7 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/12"
                >
                  Log out
                </button>
              </form>
            </div>
          </aside>

          <div className="min-w-0">
            <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(18,28,45,0.95),rgba(11,18,30,0.94))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/85">
                <BarChart3 className="h-3.5 w-3.5" />
                Internal analytics
              </div>
              <h1 className="mt-5 max-w-4xl font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {description}
              </p>
            </section>

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
