import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";

export const metadata: Metadata = {
  title: "Analytics Login",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorCopy: Record<string, string> = {
  AccessDenied:
    "Google signed in successfully, but this account is not the allowed dashboard account.",
  Configuration:
    "Dashboard auth is not fully configured yet. Add the Google auth environment variables first.",
  Default: "Sign-in did not complete. Please try again.",
};

export default async function DashboardLoginPage({ searchParams }: LoginPageProps) {
  if ((await auth())?.user?.email) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const message = error ? errorCopy[error] ?? errorCopy.Default : null;
  const authConfigured = Boolean(
    process.env.AUTH_SECRET &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-lg items-center px-5 py-16 sm:px-8">
      <section className="surface-elevated w-full rounded-[2rem] p-8 sm:p-10">
        <p className="eyebrow">Private dashboard</p>
        <h1 className="mt-5 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Sign in to HalalDL analytics.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
          This page is only for your internal growth dashboard. Nothing here is public.
        </p>

        {message && (
          <div className="mt-6 rounded-2xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-ink">
            {message}
          </div>
        )}

        {!authConfigured && (
          <div className="mt-6 rounded-2xl border border-amber bg-amber/30 px-4 py-3 text-sm text-ink">
            Add `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` to enable Google sign-in.
          </div>
        )}

        <form
          className="mt-8"
          action={async () => {
            "use server";

            try {
              await signIn("google", { redirectTo: "/dashboard" });
            } catch (error) {
              if (error instanceof AuthError) {
                redirect(`/dashboard/login?error=${error.type}`);
              }

              throw error;
            }
          }}
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
          >
            Sign in with Google
          </button>
        </form>
      </section>
    </main>
  );
}
