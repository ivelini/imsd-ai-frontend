// Хлебные крошки: .search-query-blk > p.search-query (фаза 1)
// crumb.href опционален (последний пункт — текст)
export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div className="search-query-blk">
      <p className="search-query">
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && " / "}
            {c.href ? <a href={c.href}>{c.label}</a> : c.label}
          </span>
        ))}
      </p>
    </div>
  );
}
