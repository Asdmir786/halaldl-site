"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Film, Link2, ListChecks, Music2, Sparkles } from "lucide-react";
import { HeroLiveApp } from "@/components/home/hero-live-app";
import { usePrefersReducedMotion } from "@/components/experience/use-prefers-reduced-motion";
import type { GitHubSnapshot } from "@/lib/github";

type PlaneRefs = {
  root: HTMLDivElement | null;
  preview: HTMLElement | null;
  video: HTMLElement | null;
  audio: HTMLElement | null;
  app: HTMLDivElement | null;
  completion: HTMLElement | null;
};

function setPlaneTransform(
  node: HTMLElement | null,
  transform: string,
  opacity = 1,
) {
  if (!node) return;
  node.style.transform = transform;
  node.style.opacity = String(opacity);
}

/**
 * A small 2.5D card field: actual HalalDL states become the scene objects.
 * This deliberately avoids a decorative 3D logo or a full-page WebGL canvas.
 */
export function LocalControlRoom({ github }: { github: GitHubSnapshot }) {
  const reducedMotion = usePrefersReducedMotion();
  const refs = useRef<PlaneRefs>({
    root: null,
    preview: null,
    video: null,
    audio: null,
    app: null,
    completion: null,
  });
  const pointer = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const planeRefs = refs.current;
    const root = planeRefs.root;
    if (!root || reducedMotion) return;

    let previousProgress = scrollRef.current;

    const stopFrame = () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    const tick = () => {
      if (!isVisibleRef.current || document.visibilityState !== "visible") {
        frameRef.current = null;
        return;
      }

      current.current.x += (pointer.current.x - current.current.x) * 0.045;
      current.current.y += (pointer.current.y - current.current.y) * 0.045;
      const x = current.current.x;
      const y = current.current.y;
      const progress = scrollRef.current;
      const plane = refs.current;

      setPlaneTransform(
        plane.app,
        `translate3d(${x * 7 - progress * 14}px, ${y * 5 - progress * 6}px, 0) rotateX(${y * -1.6}deg) rotateY(${x * 2.2}deg) scale(${1 - progress * 0.035})`,
      );
      setPlaneTransform(
        plane.preview,
        `translate3d(${x * 18 + progress * 66}px, ${y * 12 - progress * 34}px, 0) rotateX(${y * -3.2}deg) rotateY(${x * 5.5 - progress * 4}deg) scale(${1.03 + progress * 0.13})`,
        1 - progress * 0.12,
      );
      setPlaneTransform(
        plane.video,
        `translate3d(${x * 13 - progress * 54}px, ${y * 10 - progress * 17}px, 0) rotateX(${y * -2.4}deg) rotateY(${x * 4.4 + progress * 6}deg) scale(${0.96 + progress * 0.09})`,
        0.95 + progress * 0.05,
      );
      setPlaneTransform(
        plane.audio,
        `translate3d(${x * 16 - progress * 34}px, ${y * 13 + progress * 18}px, 0) rotateX(${y * -2.6}deg) rotateY(${x * 4.8 + progress * 4}deg) scale(${0.95 + progress * 0.08})`,
        0.9 + progress * 0.1,
      );
      setPlaneTransform(
        plane.completion,
        `translate3d(${x * 9 + progress * 14}px, ${y * 9 + progress * 12}px, 0) rotateX(${y * -1.7}deg) rotateY(${x * 2.8}deg) scale(${0.98 + progress * 0.03})`,
        0.86 + progress * 0.14,
      );

      const pointerSettled = Math.abs(pointer.current.x - x) < 0.002 && Math.abs(pointer.current.y - y) < 0.002;
      const scrollSettled = Math.abs(progress - previousProgress) < 0.0005;
      previousProgress = progress;
      if (pointerSettled && scrollSettled) {
        frameRef.current = null;
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    const startFrame = () => {
      if (isVisibleRef.current && document.visibilityState === "visible" && frameRef.current === null) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        pointer.current = { x: 0, y: 0 };
        startFrame();
        return;
      }
      pointer.current = {
        x: ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2,
        y: ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2,
      };
      startFrame();
    };

    const onScroll = () => {
      const bounds = root.getBoundingClientRect();
      scrollRef.current = Math.min(Math.max(-bounds.top / Math.max(bounds.height * 0.82, 1), 0), 1);
      startFrame();
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = Boolean(entry?.isIntersecting);
        if (isVisibleRef.current) {
          onScroll();
          startFrame();
        } else {
          stopFrame();
        }
      },
      { rootMargin: "180px 0px 180px 0px", threshold: 0 },
    );

    const onDocumentVisibility = () => {
      if (document.visibilityState === "visible") startFrame();
      else stopFrame();
    };

    visibilityObserver.observe(root);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onDocumentVisibility);
    onScroll();

    return () => {
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onDocumentVisibility);
      stopFrame();
      Object.values(planeRefs).forEach((node) => {
        if (node) {
          node.style.transform = "";
          node.style.opacity = "";
        }
      });
    };
  }, [reducedMotion]);

  return (
    <div
      ref={(node) => { refs.current.root = node; }}
      className="local-control-room hero-stage-enter"
      aria-label="Interactive HalalDL product control room"
    >
      <div className="local-control-room-grid" aria-hidden="true" />
      <div className="local-control-room-haze" aria-hidden="true" />

      <div ref={(node) => { refs.current.app = node; }} className="local-control-app" style={{ willChange: "transform" }}>
        <HeroLiveApp />
      </div>

      <article ref={(node) => { refs.current.preview = node; }} className="control-room-plane control-room-preview" style={{ willChange: "transform, opacity" }}>
        <div className="control-room-plane-kicker"><Link2 className="h-3.5 w-3.5" /> SOURCE PREVIEW</div>
        <p className="control-room-plane-title">Playlist found</p>
        <p className="control-room-plane-copy">18 entries from one supported link.</p>
        <div className="control-room-selection-row"><ListChecks className="h-3.5 w-3.5" /> 4 selected</div>
      </article>

      <article ref={(node) => { refs.current.video = node; }} className="control-room-plane control-room-output control-room-video" style={{ willChange: "transform, opacity" }}>
        <div className="control-room-plane-kicker"><Film className="h-3.5 w-3.5" /> VIDEO OUTPUT</div>
        <div className="control-room-output-stack"><span>720p</span><span>1080p</span><strong>4K</strong></div>
        <p>Source-dependent quality</p>
      </article>

      <article ref={(node) => { refs.current.audio = node; }} className="control-room-plane control-room-output control-room-audio" style={{ willChange: "transform, opacity" }}>
        <div className="control-room-plane-kicker"><Music2 className="h-3.5 w-3.5" /> AUDIO OUTPUT</div>
        <div className="control-room-output-stack"><strong>MP3</strong><span>M4A</span><span>Best</span></div>
        <p>Keep the preset local</p>
      </article>

      <article ref={(node) => { refs.current.completion = node; }} className="control-room-plane control-room-completion" style={{ willChange: "transform, opacity" }}>
        <span className="control-room-completion-icon"><CheckCircle2 className="h-4 w-4" /></span>
        <div>
          <p>Local Control Room</p>
          <span>{github.latestVersion} · preview, choose, keep</span>
        </div>
        <Sparkles className="ml-auto h-4 w-4 text-mint" />
      </article>
    </div>
  );
}
