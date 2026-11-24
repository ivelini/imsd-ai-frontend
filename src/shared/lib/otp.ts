/** Поле кода из SMS: одна цифра на ячейку, нецифры отбрасываются. */
export function replaceDigit(digits: string[], index: number, value: string): string[] {
  const next = [...digits];
  next[index] = value.replace(/\D/g, "").slice(0, 1);

  return next;
}
