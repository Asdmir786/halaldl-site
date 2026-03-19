"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-feature-card]"));
    if (!cards.length) return;
    let frame = 0;

    const updateActive = () => {
      frame = 0;
      const viewportAnchor = window.innerHeight * 0.52;
      let nextId = cards[0]?.dataset.featureCard ?? "";
      let nearest = Number.POSITIVE_INFINITY;

      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportAnchor);

        if (distance < nearest) {
          nearest = distance;
          nextId = card.dataset.featureCard ?? nextId;
        }
      }

      if (nextId) {
        setActiveId((current) => (current === nextId ? current : nextId));
      }
    };

    const queueUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActive);
    };

    queueUpdate();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }, [stories]);

  const activeStory = useMemo(
    () => stories.find((story) => story.id === activeId) ?? stories[0],
    [activeId, stories]
  );

  if (!activeStory) return null;

  return (
    <div
      ref={rootRef}
      className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.88fr)] lg:items-start xl:gap-10"
    >
      {/* Feature cards */}
      <div className="order-2 flex flex-col gap-4 lg:order-1 lg:gap-5">
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
                className={`group relative min-h-[15.5rem] rounded-[1.5rem] border p-5 text-left transition-all duration-200 sm:p-6 lg:min-h-[18.25rem] ${
                  isActive
                    ? "border-line-strong bg-paper-elevated shadow-lg"
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
            </ScrollReveal>
          );
        })}
      </div>

      {/* Screenshot display */}
      <div
        data-feature-stage-column
        className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Interactive proof
          </p>
          <p className="text-xs text-ink-muted">
            {stories.findIndex((story) => story.id === activeStory.id) + 1} / {stories.length}
          </p>
        </div>
        <div className="screenshot-frame p-3 sm:p-4">
          <div data-feature-stage className="feature-stage">
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

            <div className="absolute inset-0">
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
                            scale: isActive ? 1 : 1.012,
                            y: isActive ? 0 : 10,
                          }
                    }
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute inset-0 ${
                  isActive ? "pointer-events-auto" : "pointer-events-none"
                }`}
                    aria-hidden={!isActive}
                  >
                    <ThemedScreenshot
                      lightSrc={story.media.lightSrc}
                      darkSrc={story.media.darkSrc}
                      alt={story.media.alt}
                      sizes="(min-width: 1280px) 680px, (min-width: 1024px) 50vw, 100vw"
                      renderMode="paired"
                      imageClassName="border border-line-strong bg-paper-strong object-cover object-left-top"
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-[1.35rem] border border-line bg-paper/65 px-4 py-3">
          <p className="text-sm font-semibold text-ink">{activeStory.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{activeStory.description}</p>
        </div>
      </div>
    </div>
  );
}
