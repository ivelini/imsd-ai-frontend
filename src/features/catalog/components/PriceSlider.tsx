// Слайдер цены: интерактивный на pointer events (фаза 2)
// Разметка 1-в-1 с .price-range-static/.price-range-track шаблона
"use client";

import { useRef, useState } from "react";

interface PriceSliderProps {
  min: number;
  max: number;
  valueMin?: number;
  valueMax?: number;
  onChange: (min?: number, max?: number) => void;
}

export function PriceSlider({ min, max, valueMin, valueMax, onChange }: PriceSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<"min" | "max" | null>(null);

  const vMin = valueMin ?? min;
  const vMax = valueMax ?? max;

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const setFromEvent = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const raw = Math.round(min + ratio * (max - min));
    const v = clamp(raw);

    if (drag === "min") {
      const nextMin = Math.min(v, vMax - 1);
      onChange(nextMin > min ? nextMin : undefined, valueMax);
    } else if (drag === "max") {
      const nextMax = Math.max(v, vMin + 1);
      onChange(valueMin, nextMax < max ? nextMax : undefined);
    }
  };

  return (
    <div className="price-range-static">
      <div
        className="price-range-track"
        ref={trackRef}
        onPointerMove={(e) => {
          if (drag) setFromEvent(e.clientX);
        }}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <div
          className="price-range-fill"
          style={{ left: `${pct(vMin)}%`, right: `${100 - pct(vMax)}%` }}
        />
        <div
          className="price-range-thumb"
          style={{ left: `${pct(vMin)}%` }}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            setDrag("min");
          }}
        />
        <div
          className="price-range-thumb"
          style={{ left: `${pct(vMax)}%` }}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            setDrag("max");
          }}
        />
      </div>
    </div>
  );
}
