"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSmoothScroll } from "@/components/site/smooth-scroll-provider";

type InstallCardsScrollProps = {
  children: ReactNode;
  className?: string;
};

const PARTICLES = [
  [6, 18, 2, 0], [15, 66, 3, 1.4], [24, 31, 1, 2.2], [34, 82, 2, 0.7],
  [42, 12, 3, 3.2], [51, 55, 1, 1.8], [59, 28, 2, 0.3], [67, 76, 3, 2.7],
  [74, 11, 1, 1.1], [82, 43, 2, 3.8], [91, 67, 1, 0.5], [96, 24, 3, 2.5],
] as const;

/**
 * A short, intentional entrance: Full arrives first as the recommended path,
 * then Lite and Portable complete the choice. The final grid is always stable;
 * unlike the previous scroll-scrubbed carousel it never flashes a basic layout
 * before changing state or consumes several viewports of scroll distance.
 */
export function InstallCardsScroll({ children, className }: InstallCardsScrollProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSmoothScroll();

  useGSAP(
    () => {
      const stage = stageRef.current;
      const track = trackRef.current;
      if (!stage || !track || reducedMotion) return;

      const full = track.querySelector<HTMLElement>('[data-install-card="full"]');
      const lite = track.querySelector<HTMLElement>('[data-install-card="lite"]');
      const portable = track.querySelector<HTMLElement>('[data-install-card="portable"]');
      const crown = track.querySelector<HTMLElement>("[data-install-crown]");
      const brandMark = stage.querySelector<HTMLElement>("[data-install-mark]");
      const cards = [full, lite, portable].filter(Boolean) as HTMLElement[];
      if (!full || !lite || !portable || cards.length !== 3) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const layout = () => {
          const gap = 16;
          const stageWidth = track.clientWidth;
          const cardWidth = (stageWidth - gap * 2) / 3;
          const stageHeight = Math.max(full.offsetHeight, lite.offsetHeight, portable.offsetHeight, 420);
          const lefts = [0, cardWidth + gap, (cardWidth + gap) * 2];

          stage.dataset.entrance = "ready";
          track.style.minHeight = `${stageHeight}px`;
          cards.forEach((card, index) => {
            gsap.set(card, {
              position: "absolute",
              top: 0,
              left: lefts[index],
              width: cardWidth,
              height: stageHeight,
              transformOrigin: "50% 80%",
              force3D: true,
            });
          });

          // The recommended Full build is the first thing a visitor sees.
          gsap.set(full, { autoAlpha: 0, y: 46, z: -80, rotateX: 12, scale: 0.94 });
          gsap.set(lite, { autoAlpha: 0, x: -42, y: 36, z: -70, rotateY: 12, scale: 0.95 });
          gsap.set(portable, { autoAlpha: 0, x: 42, y: 36, z: -70, rotateY: -12, scale: 0.95 });
          if (crown) gsap.set(crown, { autoAlpha: 0, y: -9, scale: 0.55 });
          if (brandMark) gsap.set(brandMark, { autoAlpha: 0, scale: 0.72, rotate: -8 });
        };

        layout();

        const timeline = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
        });

        timeline
          .to(full, { autoAlpha: 1, y: 0, z: 0, rotateX: 0, scale: 1, duration: 0.72 })
          .to(brandMark, { autoAlpha: 0.3, scale: 1, rotate: 0, duration: 0.78, ease: "power2.out" }, "<0.08")
          .to(crown, { autoAlpha: 1, y: 0, scale: 1, duration: 0.48, ease: "back.out(1.8)" }, "<0.1")
          .to(lite, { autoAlpha: 1, x: 0, y: 0, z: 0, rotateY: 0, scale: 1, duration: 0.58 }, ">-0.1")
          .to(portable, { autoAlpha: 1, x: 0, y: 0, z: 0, rotateY: 0, scale: 1, duration: 0.58 }, "<0.12")
          .to(brandMark, { autoAlpha: 0.2, scale: 0.96, duration: 0.9, ease: "sine.out" }, "<0.08");

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            timeline.play();
            observer.disconnect();
          },
          { rootMargin: "0px 0px -23% 0px", threshold: 0.08 },
        );
        observer.observe(stage);

        return () => {
          observer.disconnect();
          timeline.kill();
          stage.removeAttribute("data-entrance");
          track.style.minHeight = "";
          gsap.set([full, lite, portable, crown, brandMark].filter(Boolean), { clearProps: "all" });
        };
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.set(cards, { autoAlpha: 0, y: 18 });
        const mobileTimeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
        mobileTimeline
          .to(full, { autoAlpha: 1, y: 0, duration: 0.5 })
          .to(lite, { autoAlpha: 1, y: 0, duration: 0.45 }, "<0.13")
          .to(portable, { autoAlpha: 1, y: 0, duration: 0.45 }, "<0.1");
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            mobileTimeline.play();
            observer.disconnect();
          },
          { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
        );
        observer.observe(stage);
        return () => {
          observer.disconnect();
          mobileTimeline.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: stageRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={stageRef} className="install-spotlight-stage">
      <div className="install-particle-field" aria-hidden="true">
        {PARTICLES.map(([x, y, size, delay], index) => (
          <span
            key={index}
            className="install-particle"
            style={{
              "--particle-x": `${x}%`,
              "--particle-y": `${y}%`,
              "--particle-size": `${size}px`,
              "--particle-delay": `${delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div data-install-mark="" className="install-brand-mark" aria-hidden="true" />
      <div
        ref={trackRef}
        className={["install-cards-track grid items-stretch gap-4 lg:grid-cols-3", className]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
