"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ThemedScreenshot } from "@/components/themed-screenshot";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { FeatureStory } from "@/lib/site";

type FeatureShowcaseProps = {
  stories: FeatureStory[];
};

const ACCENT_CHIP: Record<FeatureStory["accent"], string> = {
  mint: "bg-mint text-mint-strong",
  coral: "bg-coral text-coral-strong",
  sky: "bg-sky text-sky-strong",
};

/**
 * Scroll-pinned feature stage: the screenshot stays anchored beside the story
 * column and cross-fades as each story crosses the viewport centre. Every story
 * is written once, so nothing is restated in a second grid below the stage.
 */
export function FeatureShowcase({ stories }: FeatureShowcaseProps) {
  const [activeId, setActiveId] = useState(stories[0]?.id ?? "");
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef(new Map<string, HTMLElement>());
  const jumpLockUntil = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const stageDrift = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [18, -18]);

  const activeStory = useMemo(
    () => stories.find((story) => story.id === activeId) ?? stories[0],
    [activeId, stories]
  );
  const activeIndex = stories.findIndex((story) => story.id === activeStory?.id);

  const registerBlock = useCallback((id: string) => {
    return (node: HTMLElement | null) => {
      if (node) {
        blockRefs.current.set(id, node);
      } else {
        blockRefs.current.delete(id);
      }
    };
  }, []);

  // A thin band at the viewport centre decides which story is live, so the
  // stage never reads scroll position on every frame.
  useEffect(() => {
    const nodes = Array.from(blockRefs.current.values());
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < jumpLockUntil.current) return;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.storyId;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [stories]);

  const jumpToStory = useCallback(
    (id: string) => {
      setActiveId(id);
      // Keep IntersectionObserver from fighting the click while smooth-scroll settles.
      jumpLockUntil.current = Date.now() + (shouldReduceMotion ? 80 : 700);
      blockRefs.current.get(id)?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "center",
      });
    },
    [shouldReduceMotion]
  );

  if (!activeStory) return null;

  return (
    <div
      ref={sectionRef}
      className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-start lg:gap-12 xl:gap-16"
    >
      <div className="hidden lg:sticky lg:top-24 lg:block">
        <div className="local-control-feature-stage surface-elevated relative overflow-hidden rounded-[2rem] p-4 xl:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-line px-1 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${ACCENT_CHIP[activeStory.accent]}`}
              >
                {activeStory.label}
              </span>
              <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink-soft">
                {activeStory.stat}
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted tabular-nums">
              {activeIndex + 1} / {stories.length}
            </p>
          </div>

          <motion.div style={{ y: stageDrift }} className="screenshot-frame p-3">
            {/* aspect-video lives in Tailwind so the stage cannot collapse if globals.css is stale */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-paper-elevated">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStory.id}
                  // The stage must never rely on a viewport animation to become visible.
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 1.008 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <ThemedScreenshot
                    lightSrc={activeStory.media.lightSrc}
                    darkSrc={activeStory.media.darkSrc}
                    alt={activeStory.media.alt}
                    sizes="(min-width: 1280px) 640px, 50vw"
                    renderMode="active"
                    imageClassName="border border-line-strong bg-paper-strong object-contain object-center"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <div
            role="group"
            aria-label="Jump to a feature"
            className="mt-4 flex flex-wrap gap-2 border-t border-line px-1 pt-4"
          >
            {stories.map((story) => {
              const isActive = story.id === activeStory.id;

              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => jumpToStory(story.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                    isActive
                      ? "border-line-strong bg-paper-strong text-ink ring-1 ring-mint-strong/30"
                      : "border-line bg-paper/60 text-ink-muted hover:border-line-strong hover:text-ink-soft"
                  }`}
                >
                  {story.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:space-y-0">
        {stories.map((story, index) => {
          const isActive = story.id === activeStory.id;
          const numeral = String(index + 1).padStart(2, "0");

          return (
            <ScrollReveal key={story.id} amount={0.28} margin="0px 0px -12% 0px">
              <article
                ref={registerBlock(story.id)}
                data-story-id={story.id}
                className="feature-story-block p-5 sm:p-6 lg:flex lg:min-h-[56vh] lg:flex-col lg:justify-center lg:p-0"
              >
                <div
                  className={`lg:transition-opacity lg:duration-300 ${
                    isActive ? "lg:opacity-100" : "lg:opacity-45"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${ACCENT_CHIP[story.accent]}`}
                    >
                      {story.label}
                    </span>
                    <span className="font-display text-xs font-semibold text-ink-muted tabular-nums">
                      {numeral} / {String(stories.length).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-4 max-w-xl font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl lg:text-[1.75rem]">
                    {story.title}
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
                    {story.description}
                  </p>

                  <ul className="feature-story-signals mt-5 max-w-xl" aria-label={`${story.label} details`}>
                    {story.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>

                  <div className="screenshot-frame mt-5 p-2 lg:hidden">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-paper-elevated">
                      <ThemedScreenshot
                        lightSrc={story.media.lightSrc}
                        darkSrc={story.media.darkSrc}
                        alt={story.media.alt}
                        sizes="100vw"
                        renderMode="active"
                        imageClassName="border border-line-strong bg-paper-strong object-contain object-center"
                      />
                    </div>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
