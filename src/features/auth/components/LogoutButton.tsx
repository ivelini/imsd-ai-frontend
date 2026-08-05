"use client";
// Выход из ЛК (фаза 4) — мок logoutMock + инвалидация сессии
import { useRouter } from "next/navigation";
import { useLogout } from "@/features/auth/api/useAuthMutations";

export function LogoutButton() {
  const router = useRouter();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => router.push("/"),
    });
  };

  return (
    <button type="button" className="primary-button" onClick={handleLogout} disabled={isPending}>
      {isPending ? "Выходим..." : "Выйти"}
    </button>
  );
}
