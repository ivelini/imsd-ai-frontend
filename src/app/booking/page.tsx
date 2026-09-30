// Шаг 1 потока записи: дата и время
import type { Metadata } from "next";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { BookingTimeStep } from "@/features/booking/components/BookingTimeStep";

export const metadata: Metadata = {
  title: "Запись на шиномонтаж — Альянс",
  description: "Онлайн-запись на шиномонтаж: выберите дату, время и услуги",
};

export default function Page() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Главная", href: "/" }, { label: "Шиномонтаж" }]} />
      <BookingTimeStep />
    </>
  );
}
