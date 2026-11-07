// Плашка-бейдж: разметка шаблона (.benefit) — иконка, текст, цвет-пресет.
// Без ссылки — <span>, со ссылкой — <a> (внешняя открывается в новой вкладке).
import { BenefitIcon } from "@/shared/layout/icons";
import type { Badge } from "@/shared/types/badge";
import { toBadgeViews, type BadgeView } from "./badgeView";

export function Badge({ view }: { view: BadgeView }) {
  const content = (
    <>
      {view.iconKey && <BenefitIcon type={view.iconKey} />}
      <span>{view.text}</span>
    </>
  );

  if (!view.href) {
    return <span className={view.className}>{content}</span>;
  }

  return (
    <a
      className={view.className}
      href={view.href}
      {...(view.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}

/**
 * Стек бейджей страницы: разметка шаблона — `.benefits` > `.benefit`.
 * Пустой стек — ничего не выводим.
 */
export function Badges({ badges }: { badges: Badge[] }) {
  const views = toBadgeViews(badges);
  if (views.length === 0) return null;

  return (
    <div className="benefits">
      {views.map((view, i) => (
        <Badge key={`${view.text}-${i}`} view={view} />
      ))}
    </div>
  );
}
