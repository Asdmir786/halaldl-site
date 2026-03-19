"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Check } from "lucide-react";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { FeatureStory } from "@/lib/site";

type FeatureShowcaseProps = {
  stories: FeatureStory[];
};

export function FeatureShowcase({ stories }: FeatureShowcaseProps) {
  const [activeId, setActiveId] = useState(stories[0]?.id ?? "");
  const stageRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const parallaxProgress = useMotionValue(0.5);
  const smoothParallaxProgress = useSpring(parallaxProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.22,
  });

  const activeStory = useMemo(
    () => stories.find((story) => story.id === activeId) ?? stories[0],
    [activeId, stories]
  );
  const activeIndex = stories.findIndex((story) => story.id === activeStory?.id);
  const stageImageY = useTransform(smoothParallaxProgress, [0, 0.5, 1], [34, 0, -34]);
  const stageImageScale = useTransform(smoothParallaxProgress, [0, 0.5, 1], [1.06, 1.02, 1.06]);
  const summaryY = useTransform(smoothParallaxProgress, [0, 0.5, 1], [12, 0, -12]);

  useEffect(() => {
    if (shouldReduceMotion) {
      parallaxProgress.set(0.5);
      return;
    }

    let rafId = 0;

    const updateParallax = () => {
      const element = stageRef.current;

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalRange = viewportHeight + rect.height;
      const rawProgress = (viewportHeight - rect.top) / totalRange;
      const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);

      parallaxProgress.set(clampedProgress);
    };

    const requestUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(updateParallax);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [parallaxProgress, shouldReduceMotion]);

  if (!activeStory) return null;

  return (
    <div className="space-y-8 lg:space-y-10">
      <div
        ref={stageRef}
        className="surface-elevated relative overflow-hidden rounded-[2rem] p-4 sm:p-5 lg:p-6"
      >
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
            {stories.map((story) => {
              const isActive = story.id === activeStory.id;

              return (
                <motion.div
                  key={story.id}
                  initial={false}
                  animate={
                    shouldReduceMotion
                      ? { opacity: isActive ? 1 : 0 }
                      : {
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 1.01,
                          y: isActive ? 0 : 8,
                        }
                  }
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute inset-0 ${
                    isActive ? "pointer-events-auto" : "pointer-events-none"
                  }`}
                  aria-hidden={!isActive}
                >
                  <motion.div
                    className="absolute -inset-x-3 -inset-y-4 will-change-transform"
                    style={
                      shouldReduceMotion
                        ? undefined
                        : { y: stageImageY, scale: stageImageScale }
                    }
                  >
                    <ThemedScreenshot
                      lightSrc={story.media.lightSrc}
                      darkSrc={story.media.darkSrc}
                      alt={story.media.alt}
                      sizes="(min-width: 1280px) 1100px, 100vw"
                      renderMode="paired"
                      imageClassName="border border-line-strong bg-paper-strong object-cover object-left-top"
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="mt-4 grid gap-4 rounded-[1.4rem] border border-line bg-paper/70 p-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)] lg:items-start"
          style={shouldReduceMotion ? undefined : { y: summaryY }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Active panel
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
