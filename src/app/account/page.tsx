import type { Metadata } from "next";
import { ToolPageShell } from "@/components/fetch/tool-page-shell";
import { readSignedCookie, SESSION_COOKIE } from "@/lib/fetch/http";
import { accountSnapshot } from "@/lib/fetch/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Account — HalalDL web fetch" },
  description: "Sign in with Google for higher public-download limits.",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};


export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  let account: Awaited<ReturnType<typeof accountSnapshot>> = { signedIn: false };
  try {
    account = await accountSnapshot(await readSignedCookie(SESSION_COOKIE));
  } catch {
    account = { signedIn: false };
  }

  return (
    <ToolPageShell currentPage="account" title="Account" lede="Google sign-in raises the public limit to 75 downloads a day, three active links, and up to 4K within the file-size limit.">
      {params.error ? <p className="mb-4 text-sm font-medium text-coral-strong">Sign-in did not finish. Try again.</p> : null}
      {account.signedIn ? (
        <div className="grid gap-6">
          <p className="text-sm text-ink-soft">Signed in as <strong className="text-ink">{account.email || account.name}</strong>.</p>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-2xl border border-line px-4 py-2 text-sm font-semibold text-ink" type="submit">Sign out</button>
          </form>
          <p className="text-sm text-ink-soft">Your free account is ready for public links.</p>
        </div>
      ) : (
        <a className="glass-cta inline-flex rounded-2xl px-5 py-3 text-sm font-semibold" href="/api/auth/google">Continue with Google</a>
      )}
    </ToolPageShell>
  );
}
