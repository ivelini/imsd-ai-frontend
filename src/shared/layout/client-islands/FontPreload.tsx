"use client";
// Предзагрузка шрифтов: ReactDOM.preload кладёт <link rel="preload" as="font"> в <head>
// раньше, чем браузер дойдёт до @font-face; font-display: block не даёт нарисовать
// текст системным шрифтом, пока файл не пришёл.
import { preload } from "react-dom";
import { FONT_PRELOAD_URLS } from "@/shared/lib/fonts";

export function FontPreload(): null {
  for (const href of FONT_PRELOAD_URLS) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  return null;
}
