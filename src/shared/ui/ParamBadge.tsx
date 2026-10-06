"use client";
// p-badge с попапом описания (фаза 3, 04.08.2026)
// Переиспользуемый компонент — страница товара, каталог
import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export interface ParamBadgeProps {
  label: string;
  description: { title: string; text: string };
}

// Пустая подписка: «смонтировано» — не событие внешнего мира, а факт клиента
const emptySubscribe = () => () => {};

export function ParamBadge({ label, description }: ParamBadgeProps) {
  const [open, setOpen] = useState(false);
  // false при SSR и гидратации, true — на клиенте: портал рендерится только в браузере
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

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
