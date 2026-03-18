"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import type { FeatureStory } from "@/lib/site";

type FeatureShowcaseProps = {
  stories: FeatureStory[];
};

export function FeatureShowcase({ stories }: FeatureShowcaseProps) {
  const [activeId, setActiveId] = useState(stories[0]?.id ?? "");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-feature-card]"));
    if (!cards.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting && entry.intersectionRatio > 0.38)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        const nextId = visible.target.getAttribute("data-feature-card");
        if (nextId) {
          setActiveId((current) => (current === nextId ? current : nextId));
        }
      },
      {
        rootMargin: "-22% 0px -32% 0px",
        threshold: [0.25, 0.45, 0.65],
      },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const activeStory = useMemo(
    () => stories.find((story) => story.id === activeId) ?? stories[0],
    [activeId, stories],
  );

  if (!activeStory) {
    return null;
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
      <div className="order-2 flex flex-col gap-4 xl:order-1">
        {stories.map((story, index) => {
          const isActive = story.id === activeStory.id;

          return (
            <button
              key={story.id}
              type="button"
              data-feature-card={story.id}
              onClick={() => setActiveId(story.id)}
              className={`group rounded-[1.85rem] border p-6 text-left transition-[transform,background-color,border-color,box-shadow,opacity] duration-200 sm:p-7 ${
                isActive
                  ? "border-line-strong bg-paper-strong/92 shadow-[0_22px_54px_rgba(88,116,148,0.12)]"
                  : "border-line bg-paper-strong/72 opacity-90 hover:-translate-y-0.5 hover:border-line-strong hover:bg-paper-strong/84 hover:opacity-100"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="eyebrow">{story.label}</div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      story.accent === "mint"
                        ? "bg-mint/[0.72] text-ink"
                        : story.accent === "coral"
                          ? "bg-coral/[0.82] text-ink"
                          : "bg-sky/[0.82] text-ink"
                    }`}
                  >
                    {story.stat}
                  </span>
                  <span className="font-display text-sm font-semibold text-ink-soft">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <h3 className="mt-5 max-w-2xl font-display text-3xl font-semibold tracking-[-0.04em] text-ink">
                {story.title}
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">
                {story.description}
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-ink-soft sm:text-base">
                {story.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-ink/70" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="order-1 xl:order-2 xl:sticky xl:top-28">
        <div className="glass-panel rounded-[2.3rem] p-4 sm:p-5">
          <div className="rounded-[1.95rem] border border-line-strong bg-paper-strong/82 p-3 shadow-[0_28px_70px_rgba(86,118,156,0.12)]">
            <div className="screen-shell relative aspect-[1.16/1] overflow-hidden rounded-[1.55rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStory.id}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.985 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                    <div className="rounded-full border border-line bg-paper-strong/82 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
                      {activeStory.label}
                    </div>
                    <div className="rounded-full border border-line bg-paper-strong/82 px-3 py-1 text-xs font-semibold text-ink-soft">
                      {activeStory.stat}
                    </div>
                  </div>
                  <ThemedScreenshot
                    lightSrc={activeStory.media.lightSrc}
                    darkSrc={activeStory.media.darkSrc}
                    alt={activeStory.media.alt}
                    sizes="(min-width: 1280px) 42rem, (min-width: 1024px) 36rem, 100vw"
                    imageClassName="object-cover object-top"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
