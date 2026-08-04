"use client";
// Лайтбокс: затемнённый фон + листание изображений (фаза 3, 04.08.2026)
// Переиспользуемый компонент — для страницы товара и каталога
import { useState, useEffect, useCallback } from "react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  // ESC → закрыть
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    },
    [onClose, goPrev, goNext],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Блокировка скролла body при открытии
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox" onClick={(e) => e.stopPropagation()}>
        {/* Кнопка закрытия */}
        <button className="lightbox-close" onClick={onClose} aria-label="Закрыть">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M3 3L21 21M21 3L3 21" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Счётчик */}
        <div className="lightbox-counter">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Основное изображение */}
        <div className="lightbox-main">
          {/* Стрелка влево */}
          <button className="lightbox-arrow lightbox-arrow--left" onClick={goPrev} aria-label="Предыдущее">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <path d="M20 6L10 16L20 26" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </button>

          <img src={images[activeIndex]} alt="" className="lightbox-image" />

          {/* Стрелка вправо */}
          <button className="lightbox-arrow lightbox-arrow--right" onClick={goNext} aria-label="Следующее">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <path d="M12 6L22 16L12 26" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Миниатюры */}
        <div className="lightbox-thumbnails">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Фото ${i + 1}`}
              className={i === activeIndex ? "lightbox-thumb_active" : ""}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
