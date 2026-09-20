"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { trackAnalyticsEvent, type AnalyticsEvent } from "@/lib/analytics";

type TrackedLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  analyticsEvent: AnalyticsEvent;
};

export function TrackedLink({ analyticsEvent, onClick, ...props }: TrackedLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) trackAnalyticsEvent(analyticsEvent);
  };

  return <Link {...props} onClick={handleClick} />;
}

type TrackedAnchorProps = ComponentPropsWithoutRef<"a"> & {
  analyticsEvent: AnalyticsEvent;
};

export function TrackedAnchor({ analyticsEvent, onClick, ...props }: TrackedAnchorProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) trackAnalyticsEvent(analyticsEvent);
  };

  return <a {...props} onClick={handleClick} />;
}
