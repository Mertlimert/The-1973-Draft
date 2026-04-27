"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  message: string;
};

export function TypewriterStage({ message }: Props) {
  return (
    <div className="min-h-16 border-l border-stamp/50 pl-4">
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45 }}
          className="font-mono text-sm uppercase tracking-[0.18em] text-stamp"
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
