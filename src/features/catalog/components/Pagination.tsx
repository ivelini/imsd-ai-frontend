// Пагинация .pagination (фаза 2)
import Link from "next/link";

interface PaginationProps {
  current: number;
  total: number;
  buildHref: (page: number) => string;
}

export function Pagination({ current, total, buildHref }: PaginationProps) {
  if (total <= 1) return null;

  const pages: (number | "...")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  return (
    <div className="pagination">
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="pagination-dots">...</span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={`pagination-link${p === current ? " pagination-link_active" : ""}`}
          >
            {p}
          </Link>
        ),
      )}
      {current < total && (
        <Link href={buildHref(current + 1)} className="pagination-next">
          Следующая страница &gt;
        </Link>
      )}
    </div>
  );
}
