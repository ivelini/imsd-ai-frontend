import Link from "next/link";

// Пагинация из .template/catalog/index.html (1 2 3 4 5 ... 41 →)
export function Pagination({ page, total, basePath }: { page: number; total: number; basePath: string }) {
  const pages: (number | "...")[] = [];
  const max = 41; // из мокапа; при API — total
  const around = [1, 2, 3, 4, 5];
  for (let p = 1; p <= max; p++) {
    if (around.includes(p) || p === max) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const hrefFor = (p: number) => `${basePath}?page=${p}`;

  return (
    <div className="pagination">
      {pages.map((p, i) =>
        p === "..." ? (
          <span className="pagination-dots" key={`dots-${i}`}>
            ...
          </span>
        ) : (
          <Link
            href={hrefFor(p)}
            className={p === page ? "pagination-link pagination-link_active" : "pagination-link"}
            key={p}
          >
            {p}
          </Link>
        )
      )}
      <Link href={hrefFor(page + 1)} className="pagination-next" aria-label="Следующая страница">
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
