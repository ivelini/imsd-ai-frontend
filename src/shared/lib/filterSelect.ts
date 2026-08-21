// Кодировки select-value ⇄ FilterState (вынесено из CatalogFilter 21.08.2026)
// "0" — placeholder селекта («не выбрано») → undefined (сброс).
// value опций: int/str — как есть, размеры — префиксные (w185/p60/r15/r13c).
// Имена value 1:1 с сегментами URL (контракт: .claude/rules/api-contract.md).
import type { FilterState } from "@/features/catalog/types";

export type SelectKind = "int" | "str" | "diameter" | "width" | "profile";

type SelectValue = FilterState["diameter"] | string | number;

/** Value селекта → значение FilterState (undefined = сброс/мусор) */
export function parseSelectValue(kind: "int", value: string): number | undefined;
export function parseSelectValue(kind: "str", value: string): string | undefined;
export function parseSelectValue(kind: "diameter", value: string): number | string | undefined;
export function parseSelectValue(kind: "width" | "profile", value: string): number | undefined;
export function parseSelectValue(kind: SelectKind, value: string): SelectValue | undefined {
  if (value === "0") return undefined;
  switch (kind) {
    case "int":
      return parseInt(value, 10);
    case "str":
      return value;
    case "diameter": {
      const m = value.match(/^r?(\d+)(c?)$/i);
      if (!m) return undefined;
      return m[2] ? `${m[1]}c` : parseInt(m[1], 10);
    }
    case "width": {
      const m = value.match(/^w(\d+)$/i);
      return m ? parseInt(m[1], 10) : undefined;
    }
    case "profile": {
      const m = value.match(/^p(\d+)$/i);
      return m ? parseInt(m[1], 10) : undefined;
    }
  }
}

/** Значение FilterState → value селекта ("0" = «не выбрано») */
export function formatSelectValue(kind: SelectKind, value: SelectValue | undefined): string {
  if (value === undefined || value === 0) return "0";
  switch (kind) {
    case "diameter":
      return `r${value}`;
    case "width":
      return `w${value}`;
    case "profile":
      return `p${value}`;
    default:
      return String(value);
  }
}
