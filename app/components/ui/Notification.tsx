"use client";

import { AnimatePresence, motion } from "framer-motion";

type NotificationProps = {
  show: boolean;
  title: string;
  message: string;
  icon?: string;
};

export default function Notification({
  show,
  title,
  message,
  icon = "✨",
}: NotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 40,
          }}
          transition={{
            duration: 0.35,
          }}
          className="fixed bottom-8 right-8 z-50 w-96 rounded-3xl bg-slate-900 p-6 text-white shadow-2xl"
        >
          <div className="flex gap-4">

            <div className="text-3xl">
              {icon}
            </div>

            <div>

              <h3 className="font-bold text-lg">
                {title}
              </h3>

              <p className="mt-1 text-slate-300">
                {message}
              </p>

            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}