// Карточка новости: .news — общая для главной (features/home) и статей (features/articles)
// href — ссылка на статью (/articles/[slug]); без href — новости главной (без перехода).
// В мокапе опечатка «Подребнее» на главной — исправлено на «Подробнее» (артефакт).
export function NewsCard({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href?: string;
}) {
  return (
    <div className="news">
      <img className="news-image" src="/assets/img/news.png" alt="" />
      {href ? (
        <a className="news-title" href={href}>
          {title}
        </a>
      ) : (
        <h3 className="news-title">{title}</h3>
      )}
      <h3 className="news-text">{text}</h3>
      {href && (
        <a className="go-news-link" href={href}>
          Подробнее &gt;
        </a>
      )}
    </div>
  );
}
