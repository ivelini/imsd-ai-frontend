// Активная вкладка диаметра страницы модели (шины и диски):
// запрошенный диаметр, если он есть у модели, иначе первый.
// Пустой список — пустая строка: страница не запрашивает размеры (нет наличия).
export function activeDiameter(
  diameters: readonly { value: string }[],
  requested?: string,
): string {
  if (requested && diameters.some((d) => d.value === requested)) return requested;
  return diameters[0]?.value ?? "";
}
