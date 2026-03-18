"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import type { FeatureStory } from "@/lib/site";

type FeatureShowcaseProps = {
  stories: FeatureStory[];
};

export function FeatureShowcase({ stories }: FeatureShowcaseProps) {
  const [activeId, setActiveId] = useState(stories[0]?.id ?? "");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-feature-card]"));
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting && entry.intersectionRatio > 0.4)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const nextId = visible.target.getAttribute("data-feature-card");
        if (nextId) {
          setActiveId((current) => (current === nextId ? current : nextId));
        }
      },
      {
        rootMargin: "-20% 0px -30% 0px",
        threshold: [0.3, 0.5, 0.7],
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const activeStory = useMemo(
    () => stories.find((story) => story.id === activeId) ?? stories[0],
    [activeId, stories]
  );

  if (!activeStory) return null;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] xl:items-start">
      {/* Feature cards */}
      <div className="order-2 flex flex-col gap-3 xl:order-1">
        {stories.map((story, index) => {
          const isActive = story.id === activeStory.id;

          return (
            <button
              key={story.id}
              type="button"
              data-feature-card={story.id}
              onClick={() => setActiveId(story.id)}
              className={`group relative rounded-xl border p-5 text-left transition-all duration-200 sm:p-6 ${
                isActive
                  ? "border-line-strong bg-paper-elevated shadow-lg"
                  : "border-line bg-paper-strong/50 hover:border-line-strong hover:bg-paper-strong"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-sky-strong"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${
                      story.accent === "mint"
                        ? "bg-mint text-mint-strong"
                        : story.accent === "coral"
                          ? "bg-coral text-coral-strong"
                          : "bg-sky text-sky-strong"
                    }`}
                  >
                    {story.label}
                  </span>
                </div>
                <span className="font-display text-xs font-semibold text-ink-muted tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
                {story.title}
              </h3>

              <p
                className={`mt-2 text-sm leading-relaxed transition-colors ${
                  isActive ? "text-ink-soft" : "text-ink-muted"
                }`}
              >
                {story.description}
              </p>

              {/* Bullets - only show on active */}
              <AnimatePresence>
                {isActive && (
                  <motion.ul
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-4 space-y-2 overflow-hidden"
                  >
                    {story.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-ink-soft">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Screenshot display */}
      <div className="order-1 xl:order-2 xl:sticky xl:top-24">
        <div className="screenshot-frame p-3 sm:p-4">
          <div className="screenshot-inner screenshot-inner-wide">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStory.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative h-full w-full"
              >
                {/* Top badges */}
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                  <span className="rounded-md border border-line bg-paper-strong/90 px-2.5 py-1 text-xs font-semibold text-ink-soft backdrop-blur-sm">
                    {activeStory.label}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      activeStory.accent === "mint"
                        ? "bg-mint text-mint-strong"
                        : activeStory.accent === "coral"
                          ? "bg-coral text-coral-strong"
                          : "bg-sky text-sky-strong"
                    }`}
                  >
                    {activeStory.stat}
                  </span>
                </div>

                <ThemedScreenshot
                  lightSrc={activeStory.media.lightSrc}
                  darkSrc={activeStory.media.darkSrc}
                  alt={activeStory.media.alt}
                  sizes="(min-width: 1280px) 680px, (min-width: 1024px) 50vw, 100vw"
                  imageClassName="object-cover object-top"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
