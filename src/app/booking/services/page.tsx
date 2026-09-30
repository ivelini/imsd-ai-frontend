// Шаг 2 потока записи: услуги и параметры авто
import type { Metadata } from "next";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { BookingServicesStep } from "@/features/booking/components/BookingServicesStep";

export const metadata: Metadata = {
  title: "Услуги шиномонтажа — Альянс",
};

export default function Page() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Главная", href: "/" }, { label: "Шиномонтаж" }]} />
      <BookingServicesStep />
    </>
  );
}
