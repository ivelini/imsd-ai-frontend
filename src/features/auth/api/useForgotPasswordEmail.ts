// Ссылка сброса пароля письмом; ответ одинаковый для любой карточки (не раскрываем)
"use client";

import { useMutation } from "@tanstack/react-query";
import { forgotPasswordEmail } from "@/shared/api/data";

export function useForgotPasswordEmail() {
  return useMutation({
    mutationFn: (email: string) => forgotPasswordEmail(email),
  });
}
