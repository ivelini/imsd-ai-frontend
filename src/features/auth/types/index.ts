// Типы аккаунта: DTO ответов бэка и фронтовые формы (Scramble, 24.11.2026)

export interface ClientDto {
  id: number;
  name: string;
  surname: string | null;
  patronymic: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
}

/** Клиент после адаптера: `full_name` бэка → `fullName` */
export interface Client {
  id: number;
  name: string;
  surname: string | null;
  patronymic: string | null;
  fullName: string;
  phone: string | null;
  email: string | null;
}

export interface ClientLoginDto {
  token: string;
  client: ClientDto;
}

export interface ClientLogin {
  token: string;
  client: Client;
}

export interface LoginInput {
  phone: string;
  password: string;
}

export interface RegisterInput {
  phone: string;
  name: string;
  email: string | null;
  password: string;
  confirmation: string;
  code: string;
}

export interface ResetSmsInput {
  phone: string;
  code: string;
  password: string;
  confirmation: string;
}

export interface ResetEmailInput {
  email: string;
  token: string;
  password: string;
  confirmation: string;
}
