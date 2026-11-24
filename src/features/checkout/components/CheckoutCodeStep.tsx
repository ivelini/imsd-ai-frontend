// Шаг кода: ввод 4 цифр → POST /api/checkout с черновиком и тем же Idempotency-Key.
// Отказы различаются машинным кодом: неверный/истёкший код остаются здесь,
// пустая корзина уводит в корзину, неверная точка — к форме.
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/shared/ui/Alert";
import { OtpCodeInput } from "@/shared/ui/OtpCodeInput";
import { useConfirmCheckout } from "@/features/checkout/api/useConfirmCheckout";
import { useIssueCheckoutCode } from "@/features/checkout/api/useIssueCheckoutCode";
import { isDraftReady, setCodeIssued } from "@/features/checkout/lib/draft";
import { draftStore, snapshotStore } from "@/features/checkout/lib/draftStore";
import {
  mapCheckoutError,
  toErrorResponse,
  type CheckoutErrorResult,
  type CheckoutErrorState,
} from "@/features/checkout/lib/errors";
import { buildOrderSnapshot } from "@/features/checkout/lib/snapshot";
import { formatCountdown, resendRemaining } from "@/shared/lib/countdown";
import type { CheckoutReference } from "@/features/checkout/types";

const CODE_LENGTH = 4;

export function CheckoutCodeStep({ reference }: { reference: CheckoutReference }) {
  const router = useRouter();
  const draft = useSyncExternalStore(
    draftStore.subscribe,
    draftStore.getSnapshot,
    draftStore.getServerSnapshot,
  );
  const issueCode = useIssueCheckoutCode();
  const confirm = useConfirmCheckout();

  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<CheckoutErrorResult | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, []);

  // Прямой заход без черновика — к форме: на шаге кода сервер получает только телефон
  useEffect(() => {
    if (!isDraftReady(draft)) {
      router.replace("/checkout");
    }
  }, [draft, router]);

  if (!isDraftReady(draft)) return null;

  // Остаток кулдауна: длительность из ответа бэка, отсчёт — от момента выдачи кода
  const remaining =
    draft.codeIssuedAt !== null && draft.codeRetryAfter !== null
      ? resendRemaining({ issuedAt: draft.codeIssuedAt, retryAfter: draft.codeRetryAfter, now })
      : 0;

  const applyError = (result: CheckoutErrorResult) => {
    if (
      result.state === "code_invalid" ||
      result.state === "code_expired" ||
      result.state === "code_used"
    ) {
      setDigits(Array(CODE_LENGTH).fill(""));
    }

    setError(result);
  };

  const submit = () => {
    setError(null);
    confirm.mutate(
      { draft, code: digits.join("") },
      {
        onSuccess: (order) => {
          // Гость читает заказ только снимком: публичного чтения по id нет
          snapshotStore.write(buildOrderSnapshot(order, draft, reference));
          draftStore.clear();
          router.replace(`/order/${order.id}`);
        },
        onError: (cause) => applyError(mapCheckoutError(toErrorResponse(cause))),
      },
    );
  };

  const resend = () => {
    setError(null);
    issueCode.mutate(
      { phone: draft.phone, key: draft.idempotencyKey },
      {
        onSuccess: ({ retryAfter }) => {
          draftStore.write(setCodeIssued(draft, retryAfter, Date.now()));
          setDigits(Array(CODE_LENGTH).fill(""));
        },
        onError: (cause) => {
          const result = mapCheckoutError(toErrorResponse(cause));

          // 429 — код уже высылали: таймер считаем от остатка, а не от константы
          if (result.state === "cooldown" && result.retryAfter !== undefined) {
            draftStore.write(setCodeIssued(draft, result.retryAfter, Date.now()));
          }

          applyError(result);
        },
      },
    );
  };

  const codeReady = digits.every((digit) => digit !== "");

  return (
    <section className="order-section container">
      <h2>Подтверждение заказа</h2>
      <p className="order-status-hint">Введите код из SMS — заказ будет создан</p>

      <div className="code-card">
        <h3>Код из SMS</h3>

        {error === null ? (
          <p className="code-subtitle">
            Мы отправили SMS с кодом на номер{" "}
            <span className="code-phone">{draft.phone}</span>
          </p>
        ) : (
          <Alert title={alertTitle(error)} text={alertText(error)} />
        )}

        <OtpCodeInput digits={digits} onChange={setDigits} hasError={error !== null} />

        {error !== null && needsCart(error.state) ? (
          <button className="primary-button" type="button" onClick={() => router.push("/cart")}>
            Вернуться в корзину
          </button>
        ) : error !== null && needsForm(error.state) ? (
          <button className="primary-button" type="button" onClick={() => router.push("/checkout")}>
            Изменить данные
          </button>
        ) : (
          <>
            <p className="code-timer">
              Отправить код повторно можно через{" "}
              <span className="code-timer-value">{formatCountdown(remaining)}</span>
            </p>
            <button
              className={remaining > 0 ? "code-resend code-resend--disabled" : "code-resend"}
              type="button"
              disabled={remaining > 0 || issueCode.isPending}
              onClick={resend}
            >
              Отправить код повторно
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={!codeReady || confirm.isPending}
              onClick={submit}
            >
              Подтвердить заказ
            </button>
            <p className="code-hint">
              Код действует {reference.codeTtlMin} минут. Заказ создастся только после ввода
              кода — позиции и цены сервер берёт из корзины.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

/** Заголовок отказа: у кодов и у корзины он свой, остальные — общий. */
function alertTitle(error: CheckoutErrorResult): string {
  switch (error.state) {
    case "code_invalid":
      return "Неверный код";
    case "code_expired":
      return "Код устарел";
    case "code_used":
      return "Код уже использован";
    case "cooldown":
      return "Код уже отправлен";
    case "cart_empty":
      return "Корзина пуста";
    case "item_unavailable":
    case "stock_insufficient":
      return "Товар недоступен";
    case "pickup_point_invalid":
      return "Точка самовывоза не подходит";
    case "email_taken":
      return "Email уже занят";
    case "phone_invalid":
      return "Неверный телефон";
    case "consent_required":
      return "Нужно согласие";
    default:
      return "Не удалось оформить заказ";
  }
}

function alertText(error: CheckoutErrorResult): string {
  if (error.state === "code_invalid") {
    return "Проверьте цифры из SMS и попробуйте ещё раз или запросите новый код.";
  }
  if (error.state === "code_expired") {
    return "Срок действия кода истёк. Запросите новый код на тот же номер телефона.";
  }

  return error.message;
}

/** Отказ по корзине: чинится только возвратом в корзину. */
function needsCart(state: CheckoutErrorState): boolean {
  return (
    state === "cart_empty" || state === "item_unavailable" || state === "stock_insufficient"
  );
}

/** Отказ по данным формы/точке: чинится правкой данных. */
function needsForm(state: CheckoutErrorState): boolean {
  return state === "pickup_point_invalid" || state === "email_taken" || state === "phone_invalid";
}
