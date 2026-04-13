"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { FeatureStory } from "@/lib/site";

type FeatureShowcaseProps = {
  stories: FeatureStory[];
};

export function FeatureShowcase({ stories }: FeatureShowcaseProps) {
  const [activeId, setActiveId] = useState(stories[0]?.id ?? "");
  const shouldReduceMotion = useReducedMotion();

  const activeStory = useMemo(
    () => stories.find((story) => story.id === activeId) ?? stories[0],
    [activeId, stories]
  );
  const activeIndex = stories.findIndex((story) => story.id === activeStory?.id);

  if (!activeStory) return null;

  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="surface-elevated relative overflow-hidden rounded-[2rem] p-4 sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-col gap-3 border-b border-line px-1 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                activeStory.accent === "mint"
                  ? "bg-mint text-mint-strong"
                  : activeStory.accent === "coral"
                    ? "bg-coral text-coral-strong"
                    : "bg-sky text-sky-strong"
              }`}
            >
              {activeStory.label}
            </span>
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink-soft">
              {activeStory.stat}
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            {activeIndex + 1} / {stories.length}
          </p>
        </div>

        <div className="screenshot-frame p-3 sm:p-4">
          <div data-feature-stage className="feature-stage">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStory.id}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 1.01, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <ThemedScreenshot
                  lightSrc={activeStory.media.lightSrc}
                  darkSrc={activeStory.media.darkSrc}
                  alt={activeStory.media.alt}
                  sizes="(min-width: 1280px) 1100px, 100vw"
                  renderMode="active"
                  imageClassName="border border-line-strong bg-paper-strong object-contain object-center"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          className="mt-4 grid gap-4 rounded-[1.4rem] border border-line bg-paper/70 p-4 lg:grid-cols-[minmax(0,0.64fr)_minmax(0,0.36fr)] lg:items-start"
          initial={false}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              What changed
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink">
              {activeStory.title}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">
              {activeStory.description}
            </p>
          </div>

          <ul className="grid gap-2">
            {activeStory.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 rounded-2xl border border-line bg-paper-strong/80 px-3 py-2 text-sm text-ink-soft"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stories.map((story, index) => {
          const isActive = story.id === activeStory.id;

          return (
            <ScrollReveal
              key={story.id}
              delay={index * 0.04}
              amount={0.64}
              margin="0px 0px -18% 0px"
            >
              <button
                type="button"
                data-feature-card={story.id}
                onClick={() => setActiveId(story.id)}
                className={`group relative min-h-[14rem] rounded-[1.5rem] border p-5 text-left transition-all duration-200 sm:p-6 ${
                  isActive
                    ? "border-line-strong bg-paper-elevated shadow-lg ring-1 ring-sky-strong/20"
                    : "border-line bg-paper-strong/50 hover:border-line-strong hover:bg-paper-strong"
                }`}
              >
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
              </button>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
