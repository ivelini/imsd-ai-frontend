/**
 * Телефон бэка (канон «7XXXXXXXXXX», допускаем «8XXXXXXXXXX») → «+7 951 123-45-67».
 * Нераспознанная строка возвращается как есть: ввод пользователя не портим.
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 11 || (digits[0] !== "7" && digits[0] !== "8")) {
    return value;
  }

  const codes = `${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;

  return `+7 ${codes}`;
}
