"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function TurnstileField({
  siteKey,
  resetKey,
  onToken,
}: {
  siteKey: string;
  resetKey: number;
  onToken: (token: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let widget: string | null = null;
    let stopped = false;
    const started = Date.now();
    const mount = () => {
      if (stopped || !host.current) return;
      if (!window.turnstile) { if (Date.now() - started > 12_000) { setUnavailable(true); clearInterval(timer); } return; }
      clearInterval(timer);
      setUnavailable(false);
      try {
        widget = window.turnstile.render(host.current, {
          sitekey: siteKey,
          callback: token => { setUnavailable(false); onToken(token); },
          "expired-callback": () => onToken(""),
          "error-callback": () => { setUnavailable(true); onToken(""); },
        });
      } catch { setUnavailable(true); onToken(""); }
    };
    const timer = window.setInterval(mount, 200);
    mount();
    return () => { stopped = true; clearInterval(timer); if (widget) window.turnstile?.remove(widget); };
  }, [onToken, resetKey, siteKey]);
  return <div><div ref={host} className="min-h-16" />{unavailable ? <p role="status" className="mt-2 text-sm text-ink-soft">The security check could not load. Check your connection and reload this page.</p> : null}</div>;
}
