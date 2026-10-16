// Граница ошибок сегмента: сбой страницы (главный случай — 500 бэка) показывает
// карточку макета error.html внутри живой обвязки — шапка/подвал из root layout
// рисуются как обычно (город в шапке будет пустым: его тянет живой справочник).
// global-error.tsx остаётся нижним слоем — на случай падения самой обвязки.
"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // digest — метка серверной ошибки: по ней стек ищется в логах pm2
    console.error(error);
  }, [error]);

  // «Обновить» — полная перезагрузка (как на нижнем слое): при ожившем бэке
  // страница отрисуется заново; мягкий unstable_retry не используем
  const reload = () => window.location.reload();

  return (
    <section className="error-section container">
      <div className="error-card">
        <img className="error-picture" src="/assets/img/error.svg" alt="" />
        <h1 className="error-title">Сервис временно недоступен</h1>
        <p className="error-text">
          Произошёл технический сбой — сайт временно не может обрабатывать запросы.
          Наши специалисты уже работают над восстановлением.
        </p>
        <p className="error-text">
          Пожалуйста, попробуйте зайти позже. Приносим извинения за доставленные неудобства.
        </p>
        <button className="primary-button error-button" type="button" onClick={reload}>
          Обновить
        </button>
      </div>
    </section>
  );
}
