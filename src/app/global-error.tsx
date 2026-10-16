// Глобальная страница ошибки (docs: file-conventions/error#global-error).
// Заменяет root layout целиком — намеренно: обвязка тянет живой getGeo, а при
// недоступном бэке сайт всё равно нерабочий. У страницы ни одного обращения к
// API: свои html/body, свой импорт style.css (глобальные стили сюда не наследуются).
"use client";

import { useEffect } from "react";
import "./style.css";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // digest — метка серверной ошибки: по ней стек ищется в логах pm2
    console.error(error);
  }, [error]);

  // «Обновить» — полная перезагрузка: при ожившем бэке страница отрисуется заново,
  // при мёртвом ничего не сломает; мягкий unstable_retry не используем (помечен unstable)
  const reload = () => window.location.reload();

  return (
    <html lang="ru">
      <body>
        <main className="error-page">
          <div className="error-page-inner">
            <img className="error-page-logo" src="/assets/img/logo.svg" alt="Альянс" />
            <h1 className="error-page-title">Что-то пошло не так</h1>
            <p className="error-page-text">
              Сервис временно недоступен. Попробуйте обновить страницу или зайдите позже.
            </p>
            <div className="error-page-actions">
              <button className="primary-button error-page-button" type="button" onClick={reload}>
                Обновить
              </button>
              {/* Обычная ссылка, а не <Link>: граница может сработать и на сломанном
                  рантайме — полная загрузка надёжнее клиентской навигации */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="error-page-link" href="/">
                На главную
              </a>
            </div>
          </div>
        </main>
        {/* metadata-экспорт в client-компоненте невозможен — React сам поднимет <title> в head */}
        <title>Что-то пошло не так — Альянс</title>
      </body>
    </html>
  );
}
