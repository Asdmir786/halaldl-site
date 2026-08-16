"use client";

import { useEffect, useRef, type ReactNode } from "react";

type MotionFieldProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  threshold?: number;
};

/**
 * Starts optional section choreography after the section is visibly present.
 *
 * The wrapper intentionally never supplies a hidden initial state: content stays
 * readable when JavaScript, IntersectionObserver, or motion preferences differ.
 */
export function MotionField({
  children,
  className,
  id,
  threshold = 0.14,
}: MotionFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const activate = () => {
      element.classList.add("is-motion-active");
    };

    if (!("IntersectionObserver" in window)) {
      activate();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        activate();
        observer.disconnect();
      },
      { threshold, rootMargin: "0px 0px -8%" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  );
}
