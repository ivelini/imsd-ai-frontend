"use client";
// Раскрытие/скрытие описания товара (фаза 3, 04.08.2026)
// Описание с бэка — plain text (XLSX, без тегов): рендерим текстом, не HTML.
import { useState } from "react";

export function DescriptionExpand({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <p
        className={`section-content product-description${expanded ? "" : " product-description--collapsed"}`}
      >
        {text}
      </p>
      <div
        className="show-hide-btn-description"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(!expanded);
        }}
      >
        <span className="btn-text">{expanded ? "Скрыть" : "Показать всё"}</span>
        <svg
          className="checkmark-svg"
          xmlns="http://www.w3.org/2000/svg"
          width="9"
          height="6"
          viewBox="0 0 9 6"
          fill="none"
        >
          <path d="M8 1L4.5 5L1 0.999999" stroke="#303030" strokeLinecap="round" />
        </svg>
      </div>
    </>
  );
}
