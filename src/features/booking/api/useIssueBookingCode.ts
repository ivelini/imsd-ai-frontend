// Мутация: выдача кода подтверждения на телефон (шаг 4)
"use client";

import { useMutation } from "@tanstack/react-query";
import { issueBookingCode } from "@/shared/api/data";

export function useIssueBookingCode() {
  return useMutation({
    mutationFn: (phone: string) => issueBookingCode(phone),
  });
}
