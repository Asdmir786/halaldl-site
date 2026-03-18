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
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        const nextId = visible.target.getAttribute("data-feature-card");
        if (nextId) {
          setActiveId(nextId);
        }
      },
      {
        rootMargin: "-18% 0px -38% 0px",
        threshold: [0.2, 0.4, 0.65],
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
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_31rem]">
      <div className="order-2 flex flex-col gap-5 lg:order-1">
        {stories.map((story) => {
          const isActive = story.id === activeStory.id;

          return (
            <button
              key={story.id}
              type="button"
              data-feature-card={story.id}
              onClick={() => setActiveId(story.id)}
              className={`glass-card rounded-[2rem] p-6 text-left transition-all duration-300 sm:p-8 ${
                isActive
                  ? "translate-x-0 border-line-strong shadow-[0_26px_60px_rgba(81,111,150,0.2)]"
                  : "translate-x-0 border-line opacity-85 hover:opacity-100"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="eyebrow">{story.label}</div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    story.accent === "mint"
                      ? "bg-mint/[0.65] text-ink"
                      : story.accent === "coral"
                        ? "bg-coral/[0.75] text-ink"
                        : "bg-sky/[0.75] text-ink"
                  }`}
                >
                  {story.stat}
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[2rem]">
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

      <div className="order-1 lg:order-2 lg:sticky lg:top-24">
        <div className="glass-panel ambient-grid rounded-[2rem] p-4 sm:p-5">
          <div className="screen-shell relative aspect-[1.02/1] overflow-hidden rounded-[1.5rem] border border-line-strong shadow-[0_25px_65px_rgba(89,112,142,0.22)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStory.id}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 14, filter: "blur(12px)" }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -12, filter: "blur(10px)" }
                }
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <ThemedScreenshot
                  lightSrc={activeStory.media.lightSrc}
                  darkSrc={activeStory.media.darkSrc}
                  alt={activeStory.media.alt}
                  sizes="(min-width: 1280px) 31rem, (min-width: 1024px) 26rem, 100vw"
                  imageClassName="object-cover object-top"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,248,255,0.12),rgba(243,248,255,0)_28%,rgba(16,28,46,0.05)_100%)]" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
