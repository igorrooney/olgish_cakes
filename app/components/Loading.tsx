"use client";

import { Box, CircularProgress, Typography } from "@/lib/mui-optimization";
import { motion } from "framer-motion";
import { designTokens } from "@/lib/design-system";
import { BodyText } from "@/lib/ui-components";
import { memo } from "react";

const { colors, spacing } = designTokens;

const Loading = memo(function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: spacing["3xl"],
      }}
    >
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
        <CircularProgress size={60} thickness={4} sx={{ color: colors.primary.main }} />
      </motion.div>
      <BodyText
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        sx={{
          mt: spacing.md,
          color: colors.text.secondary,
          textAlign: "center",
        }}
      >
        Loading our delicious cakes...
      </BodyText>
    </Box>
  );
});

export default Loading;
