"use client";
// Поле кода из SMS: 4 ячейки по одной цифре (запись на шиномонтаж, оформление заказа)
import { replaceDigit } from "@/shared/lib/otp";

interface OtpCodeInputProps {
  digits: string[];
  onChange: (digits: string[]) => void;
  hasError?: boolean;
}

export function OtpCodeInput({ digits, onChange, hasError = false }: OtpCodeInputProps) {
  return (
    <div className="otp-inputs">
      {digits.map((digit, index) => (
        <input
          key={index}
          className={hasError ? "otp-digit otp-digit--error" : "otp-digit"}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          aria-label={`Цифра кода ${index + 1}`}
          onChange={(event) => onChange(replaceDigit(digits, index, event.target.value))}
        />
      ))}
    </div>
  );
}
