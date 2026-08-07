// DTO сессии (фаза 4) — контракт ответа бэка

export interface Session {
  /** Имя пользователя (после входа по логину — сам логин) */
  name: string;
  /** Телефон или email */
  login: string;
}
