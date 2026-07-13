"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  show: boolean;
};

export default function SuccessCelebration({
  show,
}: Props) {
  return (
    <AnimatePresence>

      {show && (

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
          }}
          transition={{
            duration: 0.4,
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >

          <div className="rounded-3xl bg-white p-10 text-center shadow-2xl">

            <div className="text-6xl">
              🎉
            </div>

            <h2 className="mt-4 text-3xl font-bold text-slate-900">
              Mission Complete!
            </h2>

            <p className="mt-3 text-slate-600">
              You moved one step closer to your future.
            </p>

          </div>

        </motion.div>

      )}

    </AnimatePresence>
  );
}