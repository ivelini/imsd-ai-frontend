// Экран успеха: снимок созданной записи (адрес без параметров — прямой заход уводит на шаг 1)
import type { Metadata } from "next";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { BookingSuccess } from "@/features/booking/components/BookingSuccess";

export const metadata: Metadata = {
  title: "Запись подтверждена — Альянс",
};

export default function Page() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Главная", href: "/" }, { label: "Шиномонтаж" }]} />
      <BookingSuccess />
    </>
  );
}
