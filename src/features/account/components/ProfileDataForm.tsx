"use client";
// Личные данные профиля: ФИО и email; телефон меняется отдельной карточкой
import { useState, type FormEvent } from "react";
import { mapAuthError, type AuthErrorResult } from "@/shared/api/authErrors";
import { toErrorResponse } from "@/shared/api/http";
import { validateProfile, type FieldErrors } from "@/shared/lib/validation";
import { Alert } from "@/shared/ui/Alert";
import { useUpdateProfile } from "@/features/account/api/useUpdateProfile";
import type { Client } from "@/features/auth/types";

interface ProfileDataFormProps {
  client: Client;
}

function clean(value: string): string | null {
  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

export function ProfileDataForm({ client }: ProfileDataFormProps) {
  const update = useUpdateProfile();

  const [name, setName] = useState(client.name);
  const [surname, setSurname] = useState(client.surname ?? "");
  const [patronymic, setPatronymic] = useState(client.patronymic ?? "");
  const [email, setEmail] = useState(client.email ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<AuthErrorResult | null>(null);
  const [saved, setSaved] = useState(false);

  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setSaved(false);
    setError(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (update.isPending) return;

    const errors = validateProfile({ name, email });
    setFieldErrors(errors);
    setError(null);
    setSaved(false);
    if (Object.keys(errors).length > 0) return;

    update.mutate(
      {
        name: name.trim(),
        surname: clean(surname),
        patronymic: clean(patronymic),
        email: clean(email),
      },
      {
        onSuccess: () => setSaved(true),
        onError: (cause) => setError(mapAuthError(toErrorResponse(cause))),
      },
    );
  };

  return (
    <div className="account-card">
      <h3 className="account-card-title">Личные данные</h3>
      <form onSubmit={submit}>
        <div className="account-fields-row">
          <div className="auth_field">
            <label htmlFor="account-name">Имя*</label>
            <input
              type="text"
              id="account-name"
              placeholder="Имя"
              autoComplete="given-name"
              value={name}
              onChange={(event) => edit(setName)(event.target.value)}
            />
            {fieldErrors.name !== undefined ? (
              <div className="auth_field_prompt auth_field_prompt--error">
                {fieldErrors.name}
              </div>
            ) : null}
          </div>

          <div className="auth_field">
            <label htmlFor="account-surname">Фамилия</label>
            <input
              type="text"
              id="account-surname"
              placeholder="Фамилия"
              autoComplete="family-name"
              value={surname}
              onChange={(event) => edit(setSurname)(event.target.value)}
            />
          </div>
        </div>

        <div className="account-fields-row">
          <div className="auth_field">
            <label htmlFor="account-patronymic">Отчество</label>
            <input
              type="text"
              id="account-patronymic"
              placeholder="Отчество"
              autoComplete="additional-name"
              value={patronymic}
              onChange={(event) => edit(setPatronymic)(event.target.value)}
            />
          </div>

          <div className="auth_field">
            <label htmlFor="account-email">E-mail</label>
            <input
              type="email"
              id="account-email"
              placeholder="E-mail"
              autoComplete="email"
              value={email}
              onChange={(event) => edit(setEmail)(event.target.value)}
            />
            {fieldErrors.email !== undefined ? (
              <div className="auth_field_prompt auth_field_prompt--error">
                {fieldErrors.email}
              </div>
            ) : null}
          </div>
        </div>

        {error !== null ? (
          <Alert title="Не удалось сохранить профиль" text={error.message} />
        ) : null}
        {saved ? <p className="account-saved">Сохранено</p> : null}

        <button
          className="booking-btn-primary booking-btn-primary--auto"
          type="submit"
          disabled={update.isPending}
        >
          {update.isPending ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
