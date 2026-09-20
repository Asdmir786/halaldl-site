export type AnalyticsSurface =
  | "guide_body"
  | "guide_next_step"
  | "download_hero"
  | "download_builds"
  | "download_page"
  | "flagship_comparison"
  | "comparison_table"
  | "comparison_card"
  | "roadmap";

export type ComparisonToolId =
  | "halaldl"
  | "parabolic"
  | "open-video-downloader"
  | "tartube"
  | "stacher"
  | "yt-dlp";

export type ComparisonAction =
  | "compare_full_vs_lite"
  | "open_official_source"
  | "filter_all"
  | "filter_windows"
  | "filter_cross-platform"
  | "filter_simple"
  | "filter_power"
  | "filter_archive"
  | "filter_open-source";

export type AnalyticsEvent =
  | {
      name: "download_cta_click";
      properties: {
        action: "go_to_download";
        surface: Extract<AnalyticsSurface, "guide_body" | "guide_next_step">;
      };
    }
  | {
      name: "download_channel_select";
      properties: {
        channel: "full" | "lite" | "portable" | "checksums";
        surface: Extract<AnalyticsSurface, "download_hero" | "download_builds">;
      };
    }
  | {
      name: "comparison_interaction";
      properties: {
        action: ComparisonAction;
        surface: Extract<AnalyticsSurface, "guide_body" | "guide_next_step" | "flagship_comparison" | "comparison_table" | "comparison_card">;
        tool?: ComparisonToolId;
      };
    }
  | {
      name: "open_in_app_click";
      properties: { surface: Extract<AnalyticsSurface, "flagship_comparison" | "download_page"> };
    }
  | {
      name: "extension_interest_click";
      properties: { browser?: "chrome" | "firefox" | "edge"; surface: "roadmap" };
    };

type AnalyticsDispatchOptions = {
  onSent?: () => void;
  timeoutMs?: number;
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
export function trackAnalyticsEvent(
  event: AnalyticsEvent,
  { onSent, timeoutMs = 750 }: AnalyticsDispatchOptions = {},
): void {
  if (typeof window === "undefined") return;

  const dispatch = window.gtag;
  if (!dispatch) {
    onSent?.();
  } else if (onSent) {
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      onSent();
    };

    dispatch("event", event.name, {
      ...event.properties,
      transport_type: "beacon",
      event_callback: finish,
      event_timeout: timeoutMs,
    });
    window.setTimeout(finish, timeoutMs + 50);
  } else {
    dispatch("event", event.name, event.properties);
  }

  if (process.env.NODE_ENV !== "production") {
    window.dispatchEvent(new CustomEvent("halaldl:analytics", { detail: event }));
  }
}
