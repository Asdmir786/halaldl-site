"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { ArrowRight, ExternalLink, Link2, ShieldCheck } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { buildHalalDlQueueLink, MAX_HANDOFF_URL_LENGTH } from "@/lib/handoff";

type OpenInHalalDlProps = {
  surface: "flagship_comparison" | "download_page";
  className?: string;
};

export function OpenInHalalDl({ surface, className = "" }: OpenInHalalDlProps) {
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = buildHalalDlQueueLink(value);
    if (!result.ok) {
      setAttempted(false);
      setError(result.error);
      return;
    }

    setError(null);
    setAttempted(true);
    trackAnalyticsEvent(
      { name: "open_in_app_click", properties: { surface } },
      { onSent: () => window.location.assign(result.deepLink) },
    );
  };

  return (
    <section
      aria-labelledby={`${inputId}-title`}
      className={`rounded-[1.6rem] border border-mint-strong/25 bg-mint/20 p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-mint-strong">
          <Link2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 id={`${inputId}-title`} className="font-display text-xl font-semibold text-ink">
            Paste a media link
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Validate it in this browser, then add it directly to the HalalDL queue. Requires v0.6.1 or newer; nothing starts automatically.
          </p>
        </div>
      </div>

      <form className="mt-5" onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">
          HTTP(S) media URL
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            name="halaldl-media-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={MAX_HANDOFF_URL_LENGTH + 1}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
              if (attempted) setAttempted(false);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            placeholder="https://example.com/media"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-base text-ink outline-none placeholder:text-ink-muted focus-visible:ring-2 focus-visible:ring-mint-strong/65"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-strong/70"
          >
            Add to HalalDL queue <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {error ? (
          <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-coral-strong">
            {error}
          </p>
        ) : null}
      </form>

      {attempted ? (
        <p role="status" className="mt-3 text-sm text-ink-soft">
          Sent to HalalDL. Check the Downloads queue; the browser cannot confirm whether the app received it.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-mint-strong/15 pt-4">
        <p className="inline-flex items-center gap-2 text-xs leading-relaxed text-ink-muted">
          <ShieldCheck className="h-4 w-4 shrink-0 text-mint-strong" aria-hidden="true" />
          The URL is not stored, routed through Vercel, or attached to analytics.
        </p>
        <Link
          href="/download"
          className="inline-flex items-center gap-1 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:text-mint-strong"
        >
          HalalDL not installed? Download it <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
