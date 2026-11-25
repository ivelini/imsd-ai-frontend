// Код сброса пароля по SMS; ответ несёт длительность кулдауна повторной отправки
"use client";

import { useMutation } from "@tanstack/react-query";
import { forgotPasswordSms } from "@/shared/api/data";

export function useForgotPasswordSms() {
  return useMutation({
    mutationFn: (phone: string) => forgotPasswordSms(phone),
  });
}
