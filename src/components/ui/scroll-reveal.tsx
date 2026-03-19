"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  amount?: number;
  margin?: string;
};

export function ScrollReveal({
  children,
  delay = 0,
  className,
  y = 18,
  amount = 0.2,
  margin = "0px 0px 8% 0px",
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
