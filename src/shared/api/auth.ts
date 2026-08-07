// Auth: мок-сессия в localStorage (при API — Laravel Sanctum и т.п.)
import type { Session } from "@/features/auth/types";
import { delay } from "./base";

export type { Session };

const SESSION_KEY = "session";

export async function getSession(): Promise<Session | null> {
  if (typeof localStorage !== "undefined") {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) return JSON.parse(stored) as Session;
    } catch {
      /* пусто */
    }
  }
  return null;
}

export async function loginMock(
  login: string,
  _password: string,
  _remember: boolean,
): Promise<Session> {
  // Мок принимает любые данные — имитация успешного входа
  const session: Session = { name: login, login };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return delay(30, session);
}

export async function registerMock(
  name: string,
  login: string,
  _password: string,
): Promise<Session> {
  const session: Session = { name, login };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return delay(30, session);
}

export async function logoutMock(): Promise<void> {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
  return delay(30, undefined);
}
