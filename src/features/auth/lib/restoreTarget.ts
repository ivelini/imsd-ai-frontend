/** Поле «Телефон или E-mail»: адрес — если в строке есть «@», иначе телефон. */
export function restoreTarget(value: string): "email" | "phone" {
  return value.includes("@") ? "email" : "phone";
}
