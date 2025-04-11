"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <Box className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <CircularProgress size={60} thickness={4} className="text-primary" />
      </motion.div>
      <Typography
        variant="body1"
        className="mt-4 text-gray-600"
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading our delicious cakes...
      </Typography>
    </Box>
  );
}
