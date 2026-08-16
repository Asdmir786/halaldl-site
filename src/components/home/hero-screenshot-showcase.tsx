"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/components/experience/use-prefers-reduced-motion";
import { useDocumentTheme } from "@/components/experience/use-document-theme";

// ─── Narrative screen data ────────────────────────────────────────────────────

const SCREENS = [
  {
    id: "downloads",
    label: "Downloads",
    headline: "Paste a URL. Pick a preset. Done.",
    description:
      "Drop any video, playlist, or direct media link into the URL bar. Choose a preset and hit Start — no flags, no terminal.",
    chips: ["URL autofill", "Queue management", "Live progress"],
    accent: "mint" as const,
    light: "/screenshots/github/light/halaldl-downloads.png",
    dark: "/screenshots/github/dark/halaldl-downloads-dark.png",
  },
  {
    id: "presets",
    label: "Presets",
    headline: "Your download profiles, saved.",
    description:
      "Built-in presets for Best Video, Audio MP3, WhatsApp Ready, and more. Create your own with any yt-dlp format string.",
    chips: ["Built-in profiles", "Custom presets", "yt-dlp format strings"],
    accent: "sky" as const,
    light: "/screenshots/github/light/halaldl-presets.png",
    dark: "/screenshots/github/dark/halaldl-presets-dark.png",
  },
  {
    id: "history",
    label: "History",
    headline: "Every download, right where you left it.",
    description:
      "Browse your full download history, re-queue anything, and manage your local media library — all without leaving the app.",
    chips: ["Media library", "Re-queue items", "File management"],
    accent: "coral" as const,
    light: "/screenshots/github/light/halaldl-history.png",
    dark: "/screenshots/github/dark/halaldl-history-dark.png",
  },
  {
    id: "tools",
    label: "Tools",
    headline: "yt-dlp and ffmpeg, managed for you.",
    description:
      "The Full build handles yt-dlp, ffmpeg, aria2, and related tools. Check versions, update on demand, or bring your own.",
    chips: ["yt-dlp managed", "ffmpeg bundled", "On-demand updates"],
    accent: "sky" as const,
    light: "/screenshots/github/light/halaldl-tools.png",
    dark: "/screenshots/github/dark/halaldl-tools-dark.png",
  },
  {
    id: "logs",
    label: "Logs",
    headline: "Raw output, always visible.",
    description:
      "When a site changes or an extractor breaks, the raw yt-dlp log is right there. No debug mode, no digging — just the output.",
    chips: ["Raw yt-dlp output", "No debug mode needed", "Copy diagnostics"],
    accent: "mint" as const,
    light: "/screenshots/github/light/halaldl-logs.png",
    dark: "/screenshots/github/dark/halaldl-logs-dark.png",
  },
];

const AUTO_ADVANCE_MS = 4000;

const ACCENT_COLORS = {
  mint: { dot: "#0b7f72", chip: "rgba(11,127,114,0.12)", chipText: "#0b7f72" },
  sky: { dot: "#5b7fa8", chip: "rgba(91,127,168,0.12)", chipText: "#5b7fa8" },
  coral: { dot: "#e85a42", chip: "rgba(232,90,66,0.1)", chipText: "#e85a42" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroScreenshotShowcase() {
  const reducedMotion = usePrefersReducedMotion();
  const theme = useDocumentTheme();
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0); // bumped on each transition to re-trigger CSS animations
  const containerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentTiltRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHovering = useRef(false);

  const goTo = useCallback((i: number, fromAuto = false) => {
    if (i === active) return;
    setActive(i);
    setAnimKey((k) => k + 1);
    if (!fromAuto && autoRef.current) clearTimeout(autoRef.current);
  }, [active]);

  // ── Auto-advance ──
  useEffect(() => {
    if (reducedMotion) return;
    const schedule = () => {
      autoRef.current = setTimeout(() => {
        if (!isHovering.current) {
          const next = (active + 1) % SCREENS.length;
          setActive(next);
          setAnimKey((k) => k + 1);
        }
        schedule();
      }, AUTO_ADVANCE_MS);
    };
    schedule();
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [active, reducedMotion]);

  // ── Mouse parallax tilt ──
  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onEnter = () => { isHovering.current = true; };
    const onLeave = () => {
      isHovering.current = false;
      mouseRef.current = { x: 0, y: 0 };
    };

    const tick = () => {
      const stack = stackRef.current;
      if (!stack) return;
      currentTiltRef.current.x += (mouseRef.current.x - currentTiltRef.current.x) * 0.06;
      currentTiltRef.current.y += (mouseRef.current.y - currentTiltRef.current.y) * 0.06;
      const rx = currentTiltRef.current.y * -6;
      const ry = currentTiltRef.current.x * 8;
      stack.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  const screen = SCREENS[active]!;
  const accent = ACCENT_COLORS[screen.accent];

  return (
    <div ref={containerRef} className="hero-showcase-root">

      {/* ── 3D screenshot stack ── */}
      <div
        ref={stackRef}
        className="hero-showcase-stack"
        style={{ willChange: "transform", transformStyle: "preserve-3d" }}
      >
        {SCREENS.map((s, i) => {
          const offset = i - active;
          const isActive = i === active;
          const dist = Math.abs(offset);
          const zIndex = isActive ? 30 : 10 - dist;
          const translateZ = isActive ? 0 : -55 - dist * 24;
          const translateX = isActive ? 0 : offset > 0 ? 16 + dist * 8 : -16 - dist * 8;
          const translateY = isActive ? 0 : dist * 5;
          const rotateY = isActive ? 0 : offset > 0 ? 7 + dist * 3 : -7 - dist * 3;
          const scale = isActive ? 1 : 0.9 - dist * 0.04;
          const opacity = isActive ? 1 : dist > 2 ? 0 : 0.5 - dist * 0.14;

          return (
            <div
              key={s.id}
              className="hero-showcase-card"
              style={{
                zIndex,
                transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                transition: reducedMotion ? "none" : "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.45s ease",
                cursor: isActive ? "default" : "pointer",
              }}
              onClick={() => !isActive && goTo(i)}
            >
              {/* Window chrome */}
              <div className="hero-showcase-chrome">
                <span className="hero-showcase-dot" style={{ background: "#ff5f57" }} />
                <span className="hero-showcase-dot" style={{ background: "#febc2e" }} />
                <span className="hero-showcase-dot" style={{ background: "#28c840" }} />
                <span className="hero-showcase-chrome-title">{s.label} — HalalDL</span>
              </div>
              {/* Screenshot */}
              <div className="hero-showcase-img-wrap">
                <Image
                  src={theme === "dark" ? s.dark : s.light}
                  alt={`HalalDL ${s.label} screen`}
                  fill
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="hero-showcase-img"
                  priority={i === 0}
                  quality={85}
                />
              </div>
              {/* Active glow ring */}
              {isActive && <div className="hero-showcase-active-glow" aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      {/* ── Narrative strip ── */}
      <div className="hero-showcase-narrative" key={animKey}>

        {/* Left: tab nav */}
        <div className="hero-showcase-tabs" role="tablist" aria-label="App screens">
          {SCREENS.map((s, i) => {
            const isActive = i === active;
            const ac = ACCENT_COLORS[s.accent];
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => goTo(i)}
                className={`hero-showcase-tab ${isActive ? "is-active" : ""}`}
                style={{
                  "--tab-accent": ac.dot,
                } as React.CSSProperties}
              >
                {/* Progress bar on active tab */}
                {isActive && !reducedMotion && (
                  <span
                    className="hero-showcase-tab-progress"
                    style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
                  />
                )}
                <span className="hero-showcase-tab-label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: animated copy */}
        <div className="hero-showcase-copy">
          <p
            className="hero-showcase-eyebrow"
            style={{ color: accent.dot }}
          >
            {String(active + 1).padStart(2, "0")} / {String(SCREENS.length).padStart(2, "0")}
          </p>
          <h3 className="hero-showcase-headline">
            {screen.headline}
          </h3>
          <p className="hero-showcase-desc">
            {screen.description}
          </p>
          <div className="hero-showcase-chips">
            {screen.chips.map((chip) => (
              <span
                key={chip}
                className="hero-showcase-chip"
                style={{
                  background: accent.chip,
                  color: accent.chipText,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
