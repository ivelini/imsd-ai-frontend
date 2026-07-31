import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Профиль" crumbs={[{ label: "Главная", href: "/" }, { label: "Личный кабинет" }, { label: "Профиль" }]} />;
}
