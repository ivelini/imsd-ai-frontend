"use client";
// Попап подтверждения удаления товара из корзины (фаза 3, 04.08.2026)
// Переиспользуемый — каталог, страница товара
import { useEsc } from "@/shared/lib/useEsc";

interface ConfirmRemovePopupProps {
  name: string; // название товара
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmRemovePopup({ name, onConfirm, onClose }: ConfirmRemovePopupProps) {
  useEsc(onClose);

  return (
    <div className="confirm-popup-overlay" onClick={onClose}>
      <div className="confirm-popup" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-popup-close" onClick={onClose} aria-label="Закрыть">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M1 1L15 15M15 1L1 15" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="confirm-popup-title">Убрать товар из корзины?</div>
        <div className="confirm-popup-text">{name}</div>
        <div className="confirm-popup-btns">
          <button className="confirm-popup-btn confirm-popup-btn--remove" onClick={onConfirm}>
            Убрать
          </button>
          <button className="confirm-popup-btn confirm-popup-btn--cancel" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
