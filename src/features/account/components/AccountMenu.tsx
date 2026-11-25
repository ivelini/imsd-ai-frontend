"use client";
// Меню личного кабинета: имя и телефон из сессии, разделы, выход
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPhone } from "@/shared/lib/phone";
import { useLogout } from "@/features/auth/api/useLogout";
import { useSession } from "@/features/auth/api/useSession";

export type AccountSection = "profile" | "orders" | "bookings";

interface AccountMenuProps {
  active: AccountSection;
}

const LINKS: { key: AccountSection; href: string; label: string }[] = [
  { key: "profile", href: "/account/profile", label: "Профиль" },
  { key: "orders", href: "/account/orders", label: "Мои заказы" },
  { key: "bookings", href: "/account/bookings", label: "Записи на шиномонтаж" },
];

export function AccountMenu({ active }: AccountMenuProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const logout = useLogout();

  const signOut = () => {
    logout.mutate(undefined, { onSettled: () => router.push("/") });
  };

  return (
    <aside className="account-menu">
      <div className="account-menu-user">
        <p className="account-menu-name">{session?.fullName ?? ""}</p>
        <p className="account-menu-phone">
          {session?.phone != null ? formatPhone(session.phone) : ""}
        </p>
      </div>

      <nav className="account-menu-nav">
        {LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={
              link.key === active
                ? "account-menu-link account-menu-link--active"
                : "account-menu-link"
            }
            aria-current={link.key === active ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="account-menu-logout"
        onClick={signOut}
        disabled={logout.isPending}
      >
        Выйти
      </button>
    </aside>
  );
}
