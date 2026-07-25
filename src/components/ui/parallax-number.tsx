"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

type ParallaxNumberProps = {
  value: string;
  className?: string;
  range?: number;
};

/** Oversized ghost numeral that drifts at a different rate than its card as it scrolls — a text-based parallax accent. */
export function ParallaxNumber({ value, className, range = 42 }: ParallaxNumberProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [range, -range]);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <motion.span style={{ y }}>{value}</motion.span>
    </div>
  );
}
