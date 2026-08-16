"use client";

import { HeroLiveAppViews } from "@/components/home/hero-live-app-views";
import { HeroWindowChrome } from "@/components/home/hero-live-app-ui";
import { useHeroLiveAppDemo } from "@/components/home/use-hero-live-app-demo";

export function HeroLiveApp() {
  const demo = useHeroLiveAppDemo();
  const isHistory = demo.activeNav === "history";

  return (
    <div className="hero-live-app" data-demo-stage={demo.stage} style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <HeroWindowChrome title={isHistory ? "History" : "Downloads"} />
      <HeroLiveAppViews {...demo} />
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
