// Токен анонимного диалога: localStorage, в запросах — только заголовком X-Session-Token.
// Контракт public-chat.md: 30 дней хранения, 404 — токен протух и сбрасывается.
const TOKEN_KEY = "chat_session_token";

function storage(): Storage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

export function readChatToken(): string | null {
  return storage()?.getItem(TOKEN_KEY) ?? null;
}

export function saveChatToken(token: string): void {
  storage()?.setItem(TOKEN_KEY, token);
}

export function clearChatToken(): void {
  storage()?.removeItem(TOKEN_KEY);
}
