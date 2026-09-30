// Шаг 3 потока записи: контактные данные
import type { Metadata } from "next";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { BookingDetailsStep } from "@/features/booking/components/BookingDetailsStep";

export const metadata: Metadata = {
  title: "Данные для записи — Альянс",
};

export default function Page() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Главная", href: "/" }, { label: "Шиномонтаж" }]} />
      <BookingDetailsStep />
    </>
  );
}
