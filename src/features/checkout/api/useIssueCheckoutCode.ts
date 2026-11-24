// Мутация: выслать SMS-код для оформления (шаг 1)
"use client";

import { useMutation } from "@tanstack/react-query";
import { issueCheckoutCode } from "@/shared/api/data";

interface IssueCheckoutCodeVars {
  phone: string;
  key: string;
}

export function useIssueCheckoutCode() {
  return useMutation({
    mutationFn: ({ phone, key }: IssueCheckoutCodeVars) => issueCheckoutCode(phone, key),
  });
}
