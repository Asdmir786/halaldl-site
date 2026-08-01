"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSmoothScroll } from "@/components/site/smooth-scroll-provider";

gsap.registerPlugin(ScrollTrigger);

type InstallCardsScrollProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Desktop 3D spotlight:
 *   Portable (right→center→exit+fade) →
 *   Lite (left→center→exit+fade) →
 *   Full pops with crown/VFX → fades →
 *   all three settle into the final row (Full keeps crown).
 */
export function InstallCardsScroll({ children, className }: InstallCardsScrollProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSmoothScroll();

  useGSAP(
    () => {
      const pin = pinRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      if (!pin || !stage || !track || reducedMotion) return;

      const portable = track.querySelector<HTMLElement>('[data-install-card="portable"]');
      const lite = track.querySelector<HTMLElement>('[data-install-card="lite"]');
      const full = track.querySelector<HTMLElement>('[data-install-card="full"]');
      const crown = track.querySelector<HTMLElement>("[data-install-crown]");
      const vfx = stage.querySelector<HTMLElement>("[data-install-vfx]");
      const cards = [full, lite, portable].filter(Boolean) as HTMLElement[];

      if (!portable || !lite || !full || cards.length !== 3) return;

      const mm = gsap.matchMedia();

      mm.add("(max-width: 1023px)", () => {
        gsap.set(cards, { autoAlpha: 0, y: 24 });
        if (crown) gsap.set(crown, { autoAlpha: 1, scale: 1 });
        if (vfx) gsap.set(vfx, { autoAlpha: 0 });

        cards.forEach((card, index) => {
          gsap.to(card, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            delay: index * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              once: true,
            },
          });
        });
      });

      mm.add("(min-width: 1024px)", () => {
        let timeline: gsap.core.Timeline | null = null;

        const restoreGrid = () => {
          if (timeline) {
            timeline.kill();
            timeline = null;
          }
          stage.removeAttribute("data-spotlight");
          track.style.minHeight = "";
          gsap.set([portable, lite, full, crown, vfx].filter(Boolean), { clearProps: "all" });
        };

        const buildTimeline = () => {
          const gap = 16;
          const trackWidth = track.clientWidth;
          const cardWidth = (trackWidth - gap * 2) / 3;
          const stageHeight = Math.max(
            full.offsetHeight,
            lite.offsetHeight,
            portable.offsetHeight,
            420,
          );
          const centerLeft = (trackWidth - cardWidth) / 2;
          const finaleLeft = [0, cardWidth + gap, (cardWidth + gap) * 2];
          const travelX = trackWidth * 0.55;

          stage.dataset.spotlight = "true";
          track.style.minHeight = `${stageHeight}px`;

          gsap.set(cards, {
            position: "absolute",
            top: 0,
            left: centerLeft,
            width: cardWidth,
            height: stageHeight,
            y: 0,
            z: 0,
            transformOrigin: "50% 50%",
            force3D: true,
          });

          gsap.set(portable, {
            x: travelX,
            rotateY: -32,
            z: -120,
            scale: 0.92,
            autoAlpha: 0,
            zIndex: 1,
          });
          gsap.set(lite, {
            x: -travelX,
            rotateY: 32,
            z: -120,
            scale: 0.92,
            autoAlpha: 0,
            zIndex: 1,
          });
          gsap.set(full, {
            x: 0,
            rotateY: 0,
            z: 40,
            scale: 0.72,
            autoAlpha: 0,
            zIndex: 1,
          });
          if (crown) gsap.set(crown, { autoAlpha: 0, scale: 0.4, y: -8 });
          if (vfx) gsap.set(vfx, { autoAlpha: 0, scale: 0.7 });

          const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

          // 1 — Portable: right → center
          tl.to(portable, {
            x: 0,
            rotateY: 0,
            z: 0,
            scale: 1,
            autoAlpha: 1,
            zIndex: 20,
            duration: 0.9,
            ease: "power2.out",
          });
          tl.to({}, { duration: 0.35 });

          // 2 — Portable exits left while fading
          tl.to(portable, {
            x: -travelX,
            rotateY: 24,
            z: -100,
            scale: 0.9,
            autoAlpha: 0,
            zIndex: 5,
            duration: 0.75,
            ease: "power2.in",
          });

          // 3 — Lite: left → center (overlaps exit slightly)
          tl.to(
            lite,
            {
              x: 0,
              rotateY: 0,
              z: 0,
              scale: 1,
              autoAlpha: 1,
              zIndex: 20,
              duration: 0.9,
              ease: "power2.out",
            },
            "<0.15",
          );
          tl.to({}, { duration: 0.35 });

          // 4 — Lite exits right while fading
          tl.to(lite, {
            x: travelX,
            rotateY: -24,
            z: -100,
            scale: 0.9,
            autoAlpha: 0,
            zIndex: 5,
            duration: 0.75,
            ease: "power2.in",
          });

          // 5 — Full pops + crown + VFX
          tl.to(
            full,
            {
              autoAlpha: 1,
              scale: 1.08,
              z: 60,
              rotateY: 0,
              zIndex: 30,
              duration: 0.45,
              ease: "back.out(1.6)",
            },
            ">-0.05",
          );
          if (vfx) {
            tl.to(vfx, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" }, "<");
          }
          if (crown) {
            tl.to(
              crown,
              { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(2)" },
              "<0.05",
            );
          }
          tl.to(full, { scale: 1, duration: 0.35, ease: "power2.out" });
          tl.to({}, { duration: 0.45 });

          // 6 — Full spotlight fades
          tl.to(full, {
            autoAlpha: 0,
            scale: 0.94,
            z: 0,
            duration: 0.55,
            ease: "power2.in",
          });
          if (vfx) {
            tl.to(vfx, { autoAlpha: 0, scale: 0.85, duration: 0.45, ease: "power2.in" }, "<");
          }

          // 7 — Finale row: Full · Lite · Portable
          tl.to(full, {
            left: finaleLeft[0],
            x: 0,
            y: 0,
            z: 0,
            rotateY: 0,
            scale: 1,
            autoAlpha: 1,
            zIndex: 12,
            duration: 0.85,
            ease: "power3.inOut",
          });
          tl.to(
            lite,
            {
              left: finaleLeft[1],
              x: 0,
              y: 0,
              z: 0,
              rotateY: 0,
              scale: 1,
              autoAlpha: 1,
              zIndex: 11,
              duration: 0.85,
              ease: "power3.inOut",
            },
            "<",
          );
          tl.to(
            portable,
            {
              left: finaleLeft[2],
              x: 0,
              y: 0,
              z: 0,
              rotateY: 0,
              scale: 1,
              autoAlpha: 1,
              zIndex: 10,
              duration: 0.85,
              ease: "power3.inOut",
            },
            "<",
          );
          if (crown) {
            tl.to(crown, { autoAlpha: 1, scale: 1, y: 0, duration: 0.3 }, "<0.2");
          }
          tl.to({}, { duration: 0.4 });

          return tl;
        };

        const st = ScrollTrigger.create({
          trigger: pin,
          start: "top 20%",
          end: "+=320%",
          pin: true,
          pinSpacing: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            if (!timeline) {
              if (!self.isActive && self.progress <= 0) return;
              timeline = buildTimeline();
            }
            timeline.progress(self.progress);
          },
          onLeaveBack() {
            restoreGrid();
          },
        });

        return () => {
          st.kill();
          restoreGrid();
        };
      });

      return () => mm.revert();
    },
    { scope: pinRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={pinRef} className="install-cards-pin">
      <div ref={stageRef} className="install-spotlight-stage">
        <div data-install-vfx="" className="install-full-vfx" aria-hidden="true">
          <span className="install-full-vfx-ring" />
          <span className="install-full-vfx-glow" />
          <span className="install-full-vfx-spark install-full-vfx-spark-a" />
          <span className="install-full-vfx-spark install-full-vfx-spark-b" />
          <span className="install-full-vfx-spark install-full-vfx-spark-c" />
        </div>
        <div
          ref={trackRef}
          className={[
            "install-cards-track grid items-stretch gap-4 lg:grid-cols-3",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
