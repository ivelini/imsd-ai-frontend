/** Русская форма слова по числу: plural(2, ['услуга', 'услуги', 'услуг']) → 'услуги'. */
export function plural(count: number, forms: [string, string, string]): string {
  const hundred = Math.abs(count) % 100;
  const ten = hundred % 10;

  if (hundred > 10 && hundred < 20) return forms[2];
  if (ten > 1 && ten < 5) return forms[1];
  if (ten === 1) return forms[0];

  return forms[2];
}
