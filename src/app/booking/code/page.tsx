// Шаг 4 потока записи: код из SMS (здесь же — состояния «код устарел» и «время занято»)
import type { Metadata } from "next";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { BookingCodeStep } from "@/features/booking/components/BookingCodeStep";

export const metadata: Metadata = {
  title: "Подтверждение записи — Альянс",
};

export default function Page() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Главная", href: "/" }, { label: "Шиномонтаж" }]} />
      <BookingCodeStep />
    </>
  );
}
