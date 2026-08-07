// Закрытие по Escape: подписка на keydown, отписка при размонтировании
// (общий для попапов — CartPopup, ConfirmRemovePopup, ImageLightbox)
"use client";

import { useEffect } from "react";

export function useEsc(onClose: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
}
