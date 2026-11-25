// Шрифты: список preload совпадает с @font-face, файлы существуют, swap не остался
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { FONT_PRELOAD_URLS } from "@/shared/lib/fonts";

const CSS_PATH = join(process.cwd(), "src/app/style.css");

function fontFaceUrls(css: string): string[] {
  return [...css.matchAll(/src: url\("([^"]+)"\)/g)].map((match) => match[1]);
}

describe("fontPreload", () => {
  it("test_preload_matches_font_face_urls", () => {
    // preload обязан указывать на те же файлы, что и @font-face, иначе браузер качает дважды
    const urls = fontFaceUrls(readFileSync(CSS_PATH, "utf8"));

    expect(new Set(FONT_PRELOAD_URLS)).toEqual(new Set(urls));
    expect(new Set(FONT_PRELOAD_URLS).size).toBe(4);
  });

  it("test_preload_files_exist", () => {
    // 404 на preload — скрытый текст до таймаута блока
    for (const url of FONT_PRELOAD_URLS) {
      expect(existsSync(join(process.cwd(), "public", url.replace(/^\//, "")))).toBe(true);
    }
  });

  it("test_font_display_block_only", () => {
    // swap возвращает кадр с системным шрифтом; все четыре правила — block
    const css = readFileSync(CSS_PATH, "utf8");

    expect(css.match(/font-display:\s*swap/g) ?? []).toHaveLength(0);
    expect(css.match(/font-display:\s*block/g) ?? []).toHaveLength(4);
  });
});
