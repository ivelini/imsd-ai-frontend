import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="search-query-blk">
      <p className="search-query">
        {items.map((c, i) => (
          <span key={i}>
            {i > 0 && " / "}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          </span>
        ))}
      </p>
    </div>
  );
}
