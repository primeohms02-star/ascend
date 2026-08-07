"use client";

import { useEffect } from "react";

const interactiveSelector = 'button, a[href], [role="button"]';

export default function GlobalHaptics() {
  useEffect(() => {
    if (typeof navigator.vibrate !== "function") {
      return;
    }

    const coarsePointer = window.matchMedia("(pointer: coarse)");

    function handlePointerDown(event: PointerEvent) {
      if (!coarsePointer.matches || event.pointerType === "mouse") {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const interactive = target.closest(interactiveSelector);
      if (!interactive) {
        return;
      }

      if (
        interactive.getAttribute("aria-disabled") === "true" ||
        (interactive instanceof HTMLButtonElement && interactive.disabled)
      ) {
        return;
      }

      navigator.vibrate(8);
    }

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return null;
}
