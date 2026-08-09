"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AboutModal({
  open,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-6"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 30,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 30,
            }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0B0F17]/90 p-10 shadow-[0_0_80px_rgba(255,255,255,0.05)] backdrop-blur-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-3xl text-slate-500 transition hover:text-white"
            >
              ×
            </button>

            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-amber-400">
              ASCEND
            </p>

            <h1 className="mb-8 text-5xl font-bold leading-tight text-white">
              An Operating System
              <br />
              for Human Potential
            </h1>

            <div className="space-y-8">
              <div>
                <h2 className="mb-2 text-xl font-semibold text-white">
                  Our Mission
                </h2>

                <p className="leading-8 text-slate-400">
                  To help every person discover their purpose, define their
                  direction, and continually ascend toward their highest
                  potential.
                </p>
              </div>

              <div>
                <h2 className="mb-2 text-xl font-semibold text-white">
                  Our Vision
                </h2>

                <p className="leading-8 text-slate-400">
                  A world where every individual wakes up knowing exactly what
                  they should do next, why it matters, and how to become the
                  person they were created to be.
                </p>
              </div>

              <div>
                <h2 className="mb-2 text-xl font-semibold text-white">
                  Our Philosophy
                </h2>

                <p className="leading-8 text-slate-400">
                  Purpose creates Direction.
                  <br />
                  Direction creates Momentum.
                  <br />
                  Momentum creates Growth.
                  <br />
                  Growth creates Legacy.
                </p>
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold text-white">
                  Why ASCEND Exists
                </h2>

                <p className="leading-8 text-slate-400">
                  Most people do not lack intelligence.
                  They lack clarity.
                  ASCEND exists to become the intelligent partner that helps
                  people make better decisions, build meaningful habits,
                  discover opportunities, and move confidently toward the
                  future they truly want.
                </p>
              </div>
            </div>

            <div className="mt-12 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
              <p className="text-lg italic text-white">
                "Help people become who they are capable of becoming."
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}