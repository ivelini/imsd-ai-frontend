// Временный мок блока статьи: бэк ещё не отдаёт article в ответах витрины.
// Снять после появления контракта: удалить файл и заменить вызовы
// mockArticleIfAbsent(body.article) на toArticleBlock(body.article).
import type { ArticleBlockDto } from "@/shared/types/articleBlock";

export const MOCK_ARTICLE_BLOCK: ArticleBlockDto = {
  body: [
    "<p>Подбор колёс начинается с типоразмера. Для шин это ширина, профиль и посадочный диаметр; для дисков — ширина обода, диаметр, разболтовка (PCD) и вылет (ET). Заводские параметры указаны в инструкции по эксплуатации автомобиля или на табличке в проёме водительской двери.</p>",
    "<h3>Как выбрать сезонность</h3>",
    "<ul><li>Летние шины — для температур выше +7 °C.</li><li>Зимние — с шипами или без, для низких температур и снега.</li><li>Всесезонные — компромисс для мягкого климата.</li></ul>",
    '<p><img src="/assets/img/news.png" alt="Подбор колёс"></p>',
    "<p>Если сомневаетесь в размере, воспользуйтесь подбором по автомобилю — он покажет заводские параметры и подходящие позиции.</p>",
  ].join(""),
};

/**
 * Временно: бэк ещё не отдаёт article — подставляем мок только в dev, чтобы тесты
 * и прод шли по настоящему контракту (нет объекта — нет блока).
 */
export function mockArticleIfAbsent(dto?: ArticleBlockDto | null): ArticleBlockDto | null {
  if (process.env.NODE_ENV !== "development") return dto ?? null;
  return dto ?? MOCK_ARTICLE_BLOCK;
}
