export type AnalyticsEvent =
  | {
      name: "download_cta_click";
      properties: { cta: string; surface: string };
    }
  | {
      name: "download_channel_select";
      properties: {
        channel: "full" | "lite" | "portable" | "checksums";
        surface: string;
      };
    }
  | {
      name: "comparison_interaction";
      properties: { action: string; surface: string; tool?: string };
    }
  | {
      name: "open_in_app_click";
      properties: { surface: string };
    }
  | {
      name: "extension_interest_click";
      properties: { browser?: string; surface: string };
    };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends only allowlisted product-funnel metadata. Callers must never add media
 * URLs, filenames, local paths, clipboard content, or download history.
 */
export function trackAnalyticsEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  window.gtag?.("event", event.name, event.properties);

  if (process.env.NODE_ENV !== "production") {
    window.dispatchEvent(new CustomEvent("halaldl:analytics", { detail: event }));
  }
}
