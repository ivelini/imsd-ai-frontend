"use client";
// p-badge с попапом описания (фаза 3, 04.08.2026)
// Переиспользуемый компонент — страница товара, каталог
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export interface ParamBadgeProps {
  label: string;
  description: { title: string; text: string };
}

export function ParamBadge({ label, description }: ParamBadgeProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <span
        className="p-badge"
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(!open);
        }}
      >
        {label} {">"}
      </span>

      {open && mounted &&
        createPortal(
          <div className="badge-popup-overlay" onClick={() => setOpen(false)}>
            <div className="badge-popup" onClick={(e) => e.stopPropagation()}>
              <button
                className="badge-popup-close"
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M1 1L15 15M15 1L1 15" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="badge-popup-title">{description.title}</div>
              {/* rich-текст от бэка (как service-page/articles): HTML — часть страницы */}
              <div className="badge-popup-text" dangerouslySetInnerHTML={{ __html: description.text }} />
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}
