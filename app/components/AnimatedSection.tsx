"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, memo, forwardRef } from "react";

interface AnimatedSectionProps extends HTMLMotionProps<"section"> {
  children: ReactNode;
  className?: string;
}

export const AnimatedSection = memo(
  forwardRef<HTMLElement, AnimatedSectionProps>(({ children, className = "", ...props }, ref) => {
    return (
      <motion.section
        ref={ref}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        {...props}
      >
        {children}
      </motion.section>
    );
  })
);

AnimatedSection.displayName = "AnimatedSection";

export const AnimatedDiv = memo(
  forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(({ children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        {...props}
      >
        {children}
      </motion.div>
    );
  })
);

AnimatedDiv.displayName = "AnimatedDiv";
