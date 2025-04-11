"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedWrapperProps {
  children: ReactNode;
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  transition?: Record<string, any>;
  whileHover?: Record<string, any>;
}

export default function AnimatedWrapper({
  children,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.3 },
  whileHover,
}: AnimatedWrapperProps) {
  return (
    <motion.div initial={initial} animate={animate} transition={transition} whileHover={whileHover}>
      {children}
    </motion.div>
  );
}
