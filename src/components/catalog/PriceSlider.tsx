"use client";

import { useCallback, useRef, useState } from "react";

const MIN = 5000;
const MAX = 60000;

function toPercent(v: number) {
  return ((v - MIN) / (MAX - MIN)) * 100;
}

function toValue(pct: number) {
  return Math.round(MIN + (pct / 100) * (MAX - MIN));
}

// Статичный слайдер цены из мокапа (.price-range-track/-fill/-thumb), интерактив на pointer events
export function PriceSlider({ value, onChange }: { value: [number, number]; onChange: (v: [number, number]) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<0 | 1 | null>(null);

  const setFromPointer = useCallback(
    (clientX: number, which: 0 | 1) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      const v = toValue(pct);
      const [lo, hi] = value;
      onChange(which === 0 ? [Math.min(v, hi), hi] : [lo, Math.max(v, lo)]);
    },
    [value, onChange]
  );

  const [loPct, hiPct] = [toPercent(value[0]), toPercent(value[1])];

  return (
    <div className="filter-price">
      <label htmlFor="priceRange">Цена:</label>
      <div className="input-filters">
        <div className="price-inputs">
          <span>От:</span>
          <input
            type="text"
            id="priceMin"
            value={value[0].toLocaleString("ru-RU")}
            onChange={(e) => {
              const v = Number(e.target.value.replace(/\D/g, "")) || MIN;
              onChange([Math.min(v, value[1]), value[1]]);
            }}
          />
        </div>
        <div className="price-inputs">
          <span>До:</span>
          <input
            type="text"
            id="priceMax"
            value={value[1].toLocaleString("ru-RU")}
            onChange={(e) => {
              const v = Number(e.target.value.replace(/\D/g, "")) || MAX;
              onChange([value[0], Math.max(v, value[0])]);
            }}
          />
        </div>
      </div>
      <div className="price-range-static">
        <div
          className="price-range-track"
          ref={trackRef}
          onPointerDown={(e) => {
            const rect = trackRef.current!.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setDrag(pct < loPct ? 0 : pct > hiPct ? 1 : 0);
            setFromPointer(e.clientX, pct < loPct ? 0 : 1);
          }}
        >
          <div className="price-range-fill" style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}></div>
          <div
            className="price-range-thumb"
            style={{ left: `${loPct}%` }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setDrag(0);
            }}
          ></div>
          <div
            className="price-range-thumb"
            style={{ left: `${hiPct}%` }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setDrag(1);
            }}
          ></div>
        </div>
      </div>
      {drag !== null && (
        <div
          className="price-range-drag-catcher"
          style={{ position: "fixed", inset: 0, zIndex: 9999, cursor: "grabbing" }}
          onPointerMove={(e) => setFromPointer(e.clientX, drag)}
          onPointerUp={() => setDrag(null)}
        ></div>
      )}
    </div>
  );
}
