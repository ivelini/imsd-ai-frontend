"use client";
// Раскрытие/скрытие описания товара (фаза 3, 04.08.2026)
import { useState } from "react";

export function DescriptionExpand({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className="section-content"
        style={expanded ? undefined : { maxHeight: "200px", overflow: "hidden" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
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
