# Управление Контактами (Contacts App)

Веб-приложение для создания и безопасного хранения личных контактов с изолированным доступом для каждого пользователя.

## Что умеет приложение

- Регистрация новых пользователей и авторизация (с использованием JWT-токенов).
- Полный цикл управления контактами (CRUD): добавление, просмотр, редактирование и удаление записей (имя, фамилия, email, телефон).
- Изоляция данных: каждый авторизованный пользователь видит и управляет только собственным списком контактов.
- Панель администратора (Django Admin) с настроенным поиском и фильтрацией по дате создания.
- Юнит-тестирование для бэкенда (Django `APITestCase`) и фронтенда (`Vitest` + `React Testing Library`).

## Технологии

| Слой | Стек |
|------|------|
| Backend | Python 3.12, Django 5.x, Django REST Framework, djoser, djangorestframework-simplejwt, psycopg2-binary, django-cors-headers |
| Frontend | React, Vite, Vitest |
| Database | PostgreSQL 15 |
| Infra | Docker, Docker Compose |

## Запуск (в Docker)

Проект полностью контейнеризирован. Для запуска достаточно установленного Docker и Docker Compose.

1. Склонируйте репозиторий и перейдите в папку проекта.
2. Выполните команду для сборки и запуска контейнеров в фоновом режиме:

```bash
docker compose up -d --build
```

Для применения миграций базы данных при первом запуске выполните:
```bash
docker compose exec backend python manage.py migrate
```

## Локальные адреса и порты

Проект использует нестандартные порты хоста для предотвращения конфликтов с другими приложениями на сервере:

- **Frontend (React):** `http://localhost:5174` (или `http://<ip-вашего-сервера>:5174`)
- **Backend API:** `http://localhost:8001/api/`
- **Django Панель администратора:** `http://localhost:8001/admin/`
- **База данных PostgreSQL:** `localhost:5433`

## Основные эндпоинты API

**Аутентификация (Djoser & SimpleJWT):**
- `POST /api/auth/users/` — Регистрация нового пользователя (требует `username` и `password`).
- `POST /api/auth/jwt/create/` — Вход в систему / Получение токена (требует `username` и `password`).

**Контакты (требуют заголовок `Authorization: Bearer <token>`):**
- `GET /api/contacts/` — Получить список всех контактов текущего пользователя.
- `POST /api/contacts/` — Создать новый контакт.
- `PUT /api/contacts/{id}/` — Редактировать (полностью обновить) контакт.
- `DELETE /api/contacts/{id}/` — Удалить контакт.

## Структура проекта

```text
contacts_app/
├── backend/                  # Django Backend
│   ├── api/                  # Основное приложение
│   │   ├── migrations/       # Миграции БД
│   │   ├── admin.py          # Настройки админки
│   │   ├── models.py         # Модель Contact
│   │   ├── serializers.py    # DRF сериализатор
│   │   ├── urls.py           # Маршруты контактов
│   │   ├── views.py          # API представления (ModelViewSet)
│   │   └── tests.py          # Юнит-тесты API
│   ├── config/               # Настройки Django
│   │   ├── settings.py
│   │   └── urls.py           # Главные маршруты
│   ├── manage.py
│   ├── requirements.txt      # Зависимости Python
│   └── Dockerfile
│
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── App.jsx           # Главный компонент (UI и логика)
│   │   ├── App.test.jsx      # Юнит-тесты компонентов
│   │   └── main.jsx          # Точка входа
│   ├── package.json          # Зависимости Node.js
│   ├── vite.config.js        # Настройки сборщика Vite
│   └── Dockerfile
│
└── docker-compose.yml        # Конфигурация всех сервисов (db, backend, frontend)
```