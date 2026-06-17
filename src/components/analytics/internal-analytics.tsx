"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type EventData = Record<string, string>;

type AnalyticsPayload = {
  eventName: string;
  eventType: "cta_click" | "command_copy" | "page_view" | "section_view";
  pagePath?: string;
  referrer?: string;
  data?: EventData;
};

type TrackedLinkProps = React.ComponentProps<typeof Link> & {
  eventData: EventData;
  eventName: string;
};

type TrackedAnchorProps = React.ComponentPropsWithoutRef<"a"> & {
  eventData: EventData;
  eventName: string;
};

type TrackSectionViewProps = {
  children: React.ReactNode;
  className?: string;
  eventData: EventData;
  eventName: string;
  threshold?: number;
};

const DASHBOARD_PREFIX = "/dashboard";

function shouldSkipPath(pathname: string) {
  return pathname.startsWith(DASHBOARD_PREFIX);
}

function postAnalytics(payload: AnalyticsPayload) {
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", blob);
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
    keepalive: true,
  });
}

function trackEvent(eventName: AnalyticsPayload["eventName"], eventType: AnalyticsPayload["eventType"], data: EventData) {
  postAnalytics({
    eventName,
    eventType,
    pagePath: window.location.pathname,
    data,
  });
}

export function PageViewTracker() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || shouldSkipPath(pathname)) {
      previousPathRef.current = pathname;
      return;
    }

    const referrer =
      previousPathRef.current === null
        ? document.referrer || undefined
        : `${window.location.origin}${previousPathRef.current}`;

    postAnalytics({
      eventName: "page_view",
      eventType: "page_view",
      pagePath: pathname,
      referrer,
      data: {},
    });

    previousPathRef.current = pathname;
  }, [pathname]);

  return null;
}

export function TrackedLink({ eventData, eventName, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (!shouldSkipPath(window.location.pathname)) {
          trackEvent(eventName, "cta_click", eventData);
        }
        onClick?.(event);
      }}
    />
  );
}

export function TrackedAnchor({ eventData, eventName, onClick, ...props }: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        if (!shouldSkipPath(window.location.pathname)) {
          trackEvent(eventName, "cta_click", eventData);
        }
        onClick?.(event);
      }}
    />
  );
}

export function TrackSectionView({
  children,
  className,
  eventData,
  eventName,
  threshold = 0.4,
}: TrackSectionViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || hasTrackedRef.current || shouldSkipPath(window.location.pathname)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const didIntersect = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= threshold,
        );

        if (!didIntersect || hasTrackedRef.current) {
          return;
        }

        hasTrackedRef.current = true;
        trackEvent(eventName, "section_view", eventData);
        observer.disconnect();
      },
      { threshold: [threshold] },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [eventData, eventName, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function trackCommandCopy(eventName: string, eventData: EventData) {
  if (typeof window === "undefined" || shouldSkipPath(window.location.pathname)) {
    return;
  }

  trackEvent(eventName, "command_copy", eventData);
}
