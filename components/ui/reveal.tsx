"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delayIndex?: number;
  as?: "div" | "li" | "span";
}

/** Fade + rise on scroll into view. Respects prefers-reduced-motion via Framer. */
export function Reveal({
  delayIndex = 0,
  as = "div",
  className,
  children,
  ...props
}: RevealProps) {
  const MotionComp = motion[as];
  return (
    <MotionComp
      className={className}
      variants={variants}
      custom={delayIndex}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      {...(props as object)}
    >
      {children}
    </MotionComp>
  );
}
