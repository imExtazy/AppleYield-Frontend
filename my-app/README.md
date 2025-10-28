# AppleYield SPA (Lab 5)

- Dev server: http://127.0.0.1:3000
- Backend (proxied): http://127.0.0.1:8000 через `/api`

## Скрипты

- `npm run dev` — запуск dev-сервера
- `npm run build` — сборка

## Proxy

Vite proxy настроен:
- `/api` → `http://127.0.0.1:8000`
- cookies проксируются (`credentials: include`)

## Страницы
- `/` — список услуг (фильтр по `q`)
- `/month/:id` — детальная страница услуги
- `/months_calculation/:id` — заявка

## Mock-режим
- При сетевой ошибке/таймауте `months`/`calculation` подставляются локальные mock‑данные.
- При 401/403 — mock не используется; показывается гостевой режим.

## UI
- React-Bootstrap + кастомные стили `src/styles/ay.css`.
- Navbar + Breadcrumbs.

## Media
- Изображения услуг приходят из MinIO через поле `image_url`.
