// Списки товаров главной: слайдер со scroll-snap + стрелки (03.08.2026, обновлено 05.08.2026)
// Данные — slider.tires / slider.wheels из /api/service-page/main.
// Заголовки секций статичны (решение 05.08.2026 — их нет в API).
// Стрелки — прокрутка scrollBy; disabled на краях; свайп — нативный scroll-snap.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import type { SliderTire, SliderProduct } from "@/features/home/types";
import { SectionProduct } from "./SectionProduct";
import { ArrowLeftBlackIcon, ArrowRightBlackIcon } from "@/shared/layout/icons";

function SliderArrows({ listRef }: { listRef: RefObject<HTMLDivElement | null> }) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 5);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, [listRef]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    // Стартовое состояние после монтирования
    const t = setTimeout(update, 0);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearTimeout(t);
    };
  }, [update, listRef]);

  const scroll = (dir: 1 | -1) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="slider-arrows">
      <button
        type="button"
        className="slider-arrow"
        onClick={() => scroll(-1)}
        disabled={!canPrev}
        aria-label="Назад"
      >
        <ArrowLeftBlackIcon />
      </button>
      <button
        type="button"
        className="slider-arrow"
        onClick={() => scroll(1)}
        disabled={!canNext}
        aria-label="Вперёд"
      >
        <ArrowRightBlackIcon />
      </button>
    </div>
  );
}

function SliderSection({
  className,
  heading,
  children,
}: {
  className: string;
  heading: ReactNode;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`${className} container`}>
      <div className="slider-header">
        {heading}
        <SliderArrows listRef={listRef} />
      </div>
      <div className={className === "wheels-section" ? "product-list responsive" : "product-list responsive2"} ref={listRef}>
        {children}
      </div>
    </div>
  );
}

export function WheelsList({ products }: { products: SliderTire[] }) {
  return (
    <SliderSection className="wheels-section" heading={<h2>Шины выгодно</h2>}>
      {products.map((p, i) => (
        <SectionProduct product={p} key={`${p.link}-${i}`} />
      ))}
    </SliderSection>
  );
}

export function DisksList({ products }: { products: SliderProduct[] }) {
  return (
    <SliderSection
      className="disk-section"
      heading={
        <h2 className="pr">
          Диски более <span className="highlight-text">16520</span> наименований
        </h2>
      }
    >
      {products.map((p, i) => (
        <SectionProduct product={p} key={`${p.link}-${i}`} />
      ))}
    </SliderSection>
  );
}

export function HomeProductLists({ tires, wheels }: { tires: SliderTire[]; wheels: SliderProduct[] }) {
  return (
    <>
      <WheelsList products={tires} />
      <DisksList products={wheels} />
    </>
  );
}
