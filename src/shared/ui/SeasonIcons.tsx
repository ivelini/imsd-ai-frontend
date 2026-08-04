// Иконки сезонности: солнце (лето) / снежинка (зима) / оба (всесезонка)
// Переиспользуемый компонент — страница товара, каталог
// Чисто статичные img — Server Component совместимо
import { SunIcon, SnowflakeIcon } from "./SeasonIconSvgs";

interface SeasonIconsProps {
  season?: string; // "summer" | "winter" | "all-season"
}

export function SeasonIcons({ season }: SeasonIconsProps) {
  if (!season) return null;
  const isSummer = season === "summer" || season === "all-season";
  const isWinter = season === "winter" || season === "all-season";

  return (
    <>
      {isSummer && <SunIcon />}
      {isWinter && <SnowflakeIcon />}
    </>
  );
}
