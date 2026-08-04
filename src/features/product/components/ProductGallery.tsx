"use client";
// Галерея товара: основное изображение + thumbnails + EU-лейбл + лайтбокс (фаза 3, 04.08.2026)
import { useState } from "react";
import { EuLabel } from "@/features/catalog/components/EuLabel";
import { ImageLightbox } from "@/shared/ui/ImageLightbox";
import { SeasonIcons } from "@/shared/ui/SeasonIcons";

interface ProductGalleryProps {
  images: string[];
  season?: string;
  euLabel?: {
    rollingResistance: string;
    wetGrip: string;
    noiseEmission: number;
  };
}

export function ProductGallery({ images, season, euLabel }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className="gallery">
        <div className="gallery-panel">
          <SeasonIcons season={season} />
        </div>
        <div className="main-image" onClick={() => setLightboxOpen(true)} style={{ cursor: "pointer" }}>
          <img src={images[activeIndex]} alt="" />
          {euLabel && <EuLabel {...euLabel} />}
        </div>
        <div className="thumbnails">
          {images.slice(0, 4).map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Фото ${i + 1}`}
              className={i === activeIndex ? "thumbnails_active" : undefined}
              onClick={() => setActiveIndex(i)}
            />
          ))}
          {images.length > 4 && (
            <div
              className="thumbnails-more"
              onClick={() => setLightboxOpen(true)}
            >
              +{images.length - 4}
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          initialIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
