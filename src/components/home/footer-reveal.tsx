"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type FooterRevealProps = {
  children: ReactNode;
};

export function FooterReveal({ children }: FooterRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <footer className="home-footer">{children}</footer>;
  }

  return (
    <motion.footer
      className="home-footer"
      initial={{ opacity: 0, y: 64, scale: 0.97, filter: "blur(24px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.14, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.18, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.footer>
  );
}
