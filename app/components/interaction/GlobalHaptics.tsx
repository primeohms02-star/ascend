"use client";

import { useEffect } from "react";

const interactiveSelector = 'button, a[href], [role="button"]';

export default function GlobalHaptics() {
  useEffect(() => {
    if (typeof navigator.vibrate !== "function") {
      return;
    }

    const coarsePointer = window.matchMedia("(pointer: coarse)");

    function handleClick(event: MouseEvent) {
      if (!coarsePointer.matches || event.detail === 0) {
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
        interactive.closest('[data-haptic="off"]') ||
        interactive.closest("[inert]") ||
        interactive.getAttribute("aria-disabled") === "true" ||
        (interactive instanceof HTMLButtonElement && interactive.disabled)
      ) {
        return;
      }

      try {
        navigator.vibrate(8);
      } catch {
        // Some browsers expose the API while blocking it in the current mode.
      }
    }

    document.addEventListener("click", handleClick, { passive: true });

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
