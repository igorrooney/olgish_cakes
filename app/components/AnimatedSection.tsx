"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  initial?: Record<string, any>;
  whileInView?: Record<string, any>;
  viewport?: Record<string, any>;
  transition?: Record<string, any>;
}

export function AnimatedSection({
  children,
  className,
  initial,
  whileInView,
  viewport,
  transition,
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
      className={className}
    >
      {children}
    </motion.section>
  );
}

interface AnimatedDivProps {
  children: ReactNode;
  className?: string;
  variants?: Record<string, any>;
  initial?: string | Record<string, any>;
  animate?: string | Record<string, any>;
  whileInView?: Record<string, any>;
  viewport?: Record<string, any>;
  transition?: Record<string, any>;
}

export function AnimatedDiv({
  children,
  className,
  variants,
  initial,
  animate,
  whileInView,
  viewport,
  transition,
}: AnimatedDivProps) {
  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate={animate}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
