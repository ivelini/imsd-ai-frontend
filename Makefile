DOCKER_COMPOSE = docker compose -f ../docker-compose.yml
FRONTEND       = $(DOCKER_COMPOSE) exec frontend

.PHONY: up stop down dev docker-dev install build lint bash logs help

# --- Запуск / остановка ---

## Запустить frontend в Docker (dev-сервер, в фоне)
up:
	$(DOCKER_COMPOSE) up -d frontend

## Остановить frontend-контейнер
stop:
	$(DOCKER_COMPOSE) stop frontend

## Остановить и удалить frontend-контейнер
down:
	$(DOCKER_COMPOSE) down frontend

ps:
	$(DOCKER_COMPOSE) ps

# --- Dev-сервер ---

## Запустить dev-сервер локально (npm run dev)
dev:
	npm run dev

## Запустить dev-сервер в Docker (с логами в терминале)
docker-dev:
	$(DOCKER_COMPOSE) up frontend

# --- Установка / сборка / качество ---

## Установить зависимости
install:
	npm install

## Собрать production-сборку
build:
	npm run build

## Проверить код линтером (ESLint)
lint:
	npm run lint

# --- Вход в контейнер ---

## Bash внутри frontend-контейнера
bash:
	$(FRONTEND) sh

## Логи frontend-контейнера
logs:
	$(DOCKER_COMPOSE) logs -f frontend

## Показать список всех команд
help:
	@awk '/^## /{c=substr($$0,4); next} c && /^[a-zA-Z_-]+:/{printf "  %-20s %s\n", $$1, c; c=""}' $(MAKEFILE_LIST)
