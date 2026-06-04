# Handoff — slot-home.ru (calc/)

Обновляется в конце каждой сессии. Читать перед началом работы.

---

## Текущее состояние (2026-05-27, сессия 2)

### Что работает
- Деплой: `git push release main && git push origin main` (Railway цепляет `calc_realize.git`)
- Supabase Admin REST API для создания пользователей (Pro план активен)
- **Новый Telegram auth flow (бот):** кнопка → открывает `t.me/slot_home_bot?start=LOGIN_<state>` → бот → `/api/telegram-auth/bot-session` → клиент поллит `/api/telegram-auth/status` → `verifyOtp`
- TMA (Mini App) auto sign-in через `initData`
- Ошибки пишутся в `error_logs` в Supabase, видны в /admin/logs
- **MVP TEST MODE активен:** заказы создаются без оплаты (`ENABLE_PAYMENTS=false`), сразу уходят исполнителям

### Что не тестировалось в проде
- Telegram Bot auth flow (задеплоен, живого теста не было)
- Telegram Link mode (привязка tg к email-аккаунту) — новый бот-flow, не тестировалось
- MVP flow end-to-end: калькулятор → заказ → исполнитель принимает → клиент видит исполнителя

---

## Изменения сессии 2 (2026-05-27)

### Новый Telegram auth flow — через бота

**Проблема:** oauth.telegram.org показывал форму ввода номера телефона; уведомление в Telegram не приходило.

**Решение:** Бот-based flow.

**Новые таблицы Supabase:**
| Таблица | Описание |
|---------|---------|
| `auth_sessions` | state (PK), telegram_id, first_name, last_name, username, created_at, used_at. RLS включён. |

**Новые endpoint'ы в `server.js`:**
| Endpoint | Описание |
|----------|---------|
| `POST /api/telegram-auth/bot-session` | Бот шлёт данные (HMAC через BOT_TOKEN), сервер пишет в `auth_sessions` |
| `GET /api/telegram-auth/status?state=<uuid>` | Клиент поллит каждые 2с; если сессия есть → создаёт OTP через `createTelegramSession`, возвращает `token_hash` |
| `GET /api/telegram-auth/link?state=<uuid>` | Привязка TG к существующему аккаунту: обновляет user_metadata через Admin API |

**Изменённые файлы:**
| Файл | Что изменилось |
|------|---------------|
| `src/components/auth/TelegramLoginButton.tsx` | Полный рерайт. Props: `onSuccess`, `linkMode?`. Самодостаточный: генерирует state, открывает бот, поллит, вызывает verifyOtp. |
| `src/components/auth/AuthModal.tsx` | `handleTelegramAuth(tgUser)` → `handleTelegramSuccess()`. Убраны `tgLoading`/`tgError`. |
| `src/components/steps/AuthStep.tsx` | Аналогично AuthModal. |
| `src/performer/pages/PerformerAuthPage.tsx` | Аналогично AuthModal. |
| `src/dashboard/pages/ProfileSettingsPage.tsx` | `onAuth={handleLink}` → `onSuccess={handleLink} linkMode`. |
| `src/performer/pages/ProfilePage.tsx` | Аналогично ProfileSettingsPage. |
| `bot/index.ts` | `/start LOGIN_<state>` → вызов `POST /api/telegram-auth/bot-session` с HMAC-подписью. |

**Архитектура flow:**
```
Клиент: кнопка нажата
  → generateState() → UUID hex 32 символа
  → window.open(t.me/slot_home_bot?start=LOGIN_<state>)
  → polling: GET /api/telegram-auth/status?state=<state> каждые 2с

Бот: /start LOGIN_<state>
  → storeAuthSession() → POST /api/telegram-auth/bot-session
  → HMAC(BOT_TOKEN, payload) в X-Bot-Signature
  → Сервер: верифицирует HMAC, INSERT auth_sessions

Сервер /status:
  → SELECT auth_sessions WHERE state=?
  → if found: createTelegramSession(telegram_id, meta) → token_hash
  → PATCH auth_sessions SET used_at=now()
  → return { status: "ready", token_hash }

Клиент: verifyOtp(token_hash) → onSuccess()
```

**Что НЕ трогали:** Widget auth (server.js код сохранён), TMA flow, оплата, performer flow, admin panel.

---

## Изменения сессии 1 (2026-05-27)

### MVP TEST MODE — убрана обязательная оплата

**Новые файлы:**

| Файл | Что делает |
|------|-----------|
| `src/lib/featureFlags.ts` | `ENABLE_PAYMENTS = false`. Поменяй на `true` чтобы вернуть оплату. |
| `src/components/ui/TestModeBanner.tsx` | Amber баннер "Тестовый режим" |

**Изменённые файлы:**

| Файл | Что изменилось |
|------|---------------|
| `src/components/Calculator.tsx` | При `ENABLE_PAYMENTS=false` вызывает `createOrderDirectly()` вместо `setPendingOrder()`. Вставка в `orders` (audit log) стала non-blocking. |
| `src/dashboard/store/dashboardStore.ts` | Добавлен `createOrderDirectly()` — создаёт SharedOrder и Order без шага оплаты. Новый timeline: "Заказ создан" → "Поиск исполнителя" → "Исполнитель найден" → "Заказ выполнен". Все обновления timeline переведены с index-based (`i >= 2`) на label-based (не трогает "Заказ выполнен") — безопасно для старых и новых заказов. `confirmOrderCompletion` теперь помечает последний timeline-event выполненным. |
| `src/components/steps/CheckoutStep.tsx` | Добавлены: price disclaimer (синий) + TEST MODE notice (amber) перед кнопкой "Оформить заказ". |
| `src/dashboard/pages/DashboardPage.tsx` | `<PaymentModal />` рендерится только при `ENABLE_PAYMENTS=true`. Добавлен `<TestModeBanner />` вверху страницы. |
| `src/dashboard/pages/OrderDetailsPage.tsx` | Предупреждение "Оплачивайте через платформу" → TEST MODE info при `ENABLE_PAYMENTS=false`. Добавлен price disclaimer в секции стоимости. Кнопка "Оплатить заказ" скрыта при `ENABLE_PAYMENTS=false`. |

**Что НЕ трогали:** performer flow, admin panel, analytics, chats, verification, auth, onboarding, PaymentModal (код сохранён, просто не рендерится).

---

### Фикс краша на `/performer/orders/*`

**Файл:** `src/performer/store/performerStore.ts`
**Что:** `"cancelled"` → `"rejected"` при маппинге завершённых заказов (строка ~169).
**Почему:** `config["cancelled"]` в StatusBadge → `undefined` → `const { label } = undefined` → краш.

**Файл:** `src/performer/components/ui/StatusBadge.tsx`
**Что:** Тип `config` с `Record<PerformerOrderStatus, ...>` на `Record<string, ...>`.
**Почему:** Страховка — `??` fallback теперь работает для любого незнакомого статуса.

---

### Анимация TelegramLoginButton

**Файл:** `src/components/auth/TelegramLoginButton.tsx`
**Что:** Spinner (`animate-spin` border) заменён на три прыгающих точки (`animate-bounce`) — в обоих состояниях загрузки.

---

## Изменения (2026-05-26)

### `server.js` — фикс `email_exists` (422)
`createTelegramSession` использует `/auth/v1/admin/generate_link` напрямую — создаёт пользователя если нет, или генерит ссылку если есть. Больше не нужен find-then-create.

**Что не сработало:**
- `filter=email.eq.xxx` в Admin API — не поддерживается
- `pg` + `jsonwebtoken` для обхода egress quota — откатили после оплаты Pro плана

### `Dockerfile` — фикс Docker cache
`ARG RAILWAY_GIT_COMMIT_SHA` перенесён ПЕРЕД `COPY . .` — Railway теперь ломает кеш на каждый деплой.

---

## Архитектура

```
calc/
├── server.js                        # Node HTTP сервер (Railway, port 8080)
│   ├── POST /api/telegram-auth           # Widget/TMA auth (legacy, не используется для login)
│   ├── POST /api/telegram-auth/bot-session  # Бот → сервер (HMAC)
│   ├── GET  /api/telegram-auth/status    # Клиент поллит статус
│   ├── GET  /api/telegram-auth/link      # Привязка TG к аккаунту
│   └── /supabase-proxy/*                 # Прокси к Supabase (обход DNS-блокировок)
├── src/
│   ├── lib/
│   │   ├── featureFlags.ts          # ENABLE_PAYMENTS flag
│   │   └── db.ts                    # Supabase DB helpers
│   ├── components/
│   │   ├── Calculator.tsx           # Калькулятор, главный flow клиента
│   │   ├── steps/CheckoutStep.tsx   # Последний шаг — показывает disclaimer
│   │   ├── auth/AuthModal.tsx       # Модалка входа
│   │   ├── auth/TelegramLoginButton.tsx
│   │   └── ui/TestModeBanner.tsx    # TEST MODE amber banner
│   ├── dashboard/
│   │   ├── store/dashboardStore.ts  # Стейт клиента: заказы, createOrderDirectly()
│   │   ├── pages/DashboardPage.tsx
│   │   └── pages/OrderDetailsPage.tsx
│   ├── performer/
│   │   ├── store/performerStore.ts
│   │   └── components/ui/StatusBadge.tsx
│   └── pages/tma/TMAApp.tsx        # Telegram Mini App
├── Dockerfile                       # multi-stage: builder → runtime
└── HANDOFF.md                       # этот файл
```

### Git remotes
- `origin` → `tarasovMitya/slot.git` (backup)
- `release` → `tarasovMitya/calc_realize.git` (Railway auto-deploy)
- **Всегда пушить в оба:** `git push release main && git push origin main`

### Env vars на Railway (service `calc_realize`)
| Var | Назначение |
|-----|-----------|
| `VITE_SUPABASE_URL` | URL проекта Supabase |
| `VITE_SUPABASE_ANON_KEY` | anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (секретный) |
| `BOT_TOKEN` | Токен бота `slot_home_bot` |
| `VITE_DADATA_KEY` | DaData API |
| `PORT` | 8080 (default) |

---

## Диагностика

### Смотреть ошибки (Supabase MCP)
```sql
SELECT error_message, stack_trace, component, page, created_at
FROM error_logs ORDER BY created_at DESC LIMIT 20;
```

### TypeScript
```bash
cd /Users/milty/Documents/vscode/calc && npx tsc -b --noEmit
```

### Проверить деплой
Railway dashboard → project `exquisite-adaptation` → service `calc_realize`

---

## Следующие задачи

- [ ] Протестировать новый Telegram Bot auth flow вживую (кнопка → бот → авторизован)
- [ ] Протестировать MVP flow end-to-end в проде
- [ ] Протестировать Link mode (привязка Telegram к email-аккаунту)
- [ ] Добавить `sourcemap: true` в `vite.config` для читаемых stack trace

---

## Изменения сессии (2026-06-03 / 2026-06-04)

### 1. Кабинет аффилейт-менеджера (`/affiliate`)

**База данных (Supabase — `qkhccmlrrhdfsjqnfyiu`)**
- `profiles` — добавлены `affiliate_code TEXT UNIQUE`, `platform_commission_rate NUMERIC(5,4) DEFAULT 0.10`
- `performer_profiles` — добавлена `affiliate_manager_id UUID REFERENCES auth.users(id)`
- Новая таблица `affiliate_tasks` — задачи от администратора (title, description, priority, target, due_date)
- Новая таблица `affiliate_task_completions` — отметки о выполнении
- Новая таблица `affiliate_earnings_log` — лог комиссий
- RLS-политики: аффилейт видит только своих исполнителей, заказы, чаты, задачи, начисления
- Триггер `trg_affiliate_earnings` — создаёт запись при статусе заказа `completed`
- Функция `record_affiliate_earnings()` — 15% от 10% от суммы заказа

**Новые файлы**
| Файл | Назначение |
|---|---|
| `src/affiliate/types/index.ts` | Типы: AffiliatePerformer, AffiliateOrder, AffiliateEarning, AffiliateTask, AffiliateStats |
| `src/affiliate/lib/affiliateDb.ts` | DB-слой |
| `src/affiliate/store/affiliateStore.ts` | Zustand store |
| `src/affiliate/components/AffiliateGuard.tsx` | Проверка роли `affiliate_manager` |
| `src/affiliate/components/layout/AffiliateLayout.tsx` | Layout с сайдбаром |
| `src/affiliate/components/layout/AffiliateSidebar.tsx` | Боковая панель |
| `src/affiliate/pages/OverviewPage.tsx` | KPI-карточки |
| `src/affiliate/pages/PerformersPage.tsx` | Таблица исполнителей (read-only) |
| `src/affiliate/pages/OrdersPage.tsx` | Заказы с фильтром (read-only) |
| `src/affiliate/pages/DisputesPage.tsx` | Споры |
| `src/affiliate/pages/ChatsPage.tsx` | Чаты `performer_admin` |
| `src/affiliate/pages/FinancePage.tsx` | Таблица начислений |
| `src/affiliate/pages/TasksPage.tsx` | Задачник |
| `src/affiliate/pages/ReferralPage.tsx` | Реферальная ссылка |

**Реферальная регистрация**
- `src/performer/pages/PerformerAuthPage.tsx` — при `?ref=CODE` сохраняет код в localStorage
- `src/performer/onboarding/PerformerOnboarding.tsx` — после онбординга вызывает `affiliateLinkPerformerByCode()`

**Ограничения доступа — аффилейт НЕ видит:**
- Логи ошибок и системные события
- Глобальные финансы платформы
- Настройки калькулятора и ставок
- Продуктовые метрики и аналитику
- Верификацию и управление клиентами

---

### 2. Dark SaaS UI редизайн кабинетов

**Источник:** https://saas-ui.dev/nextjs-starter-kit

**Цвета:** фон `#080a14`, сайдбар `#0c0e1a`, карточки `#0f1120`, акцент `#006AFF`

**Изменения сайдбаров (Admin + Affiliate):**
- Поиск по разделам
- Active-пункт: синий highlight + левый акцент
- Аватар с инициалами в footer

**Обновлённые файлы:**
- `src/admin/components/layout/AdminSidebar.tsx`
- `src/admin/components/layout/AdminLayout.tsx`
- `src/affiliate/components/layout/AffiliateSidebar.tsx`
- `src/affiliate/components/layout/AffiliateLayout.tsx`
- Все страницы в `src/admin/pages/` и `src/affiliate/pages/`

---

### 3. Исправления TypeScript (билд Railway)

**Коммит `7c5d2ee`**
- `ChatsPage.tsx` — убран неиспользуемый `performers`, добавлен `clientId: null` в маппинг
- `TasksPage.tsx` — убран неиспользуемый импорт `AlertTriangle`

**Коммит `827b6cb`**
- `admin/pages/OverviewPage.tsx` — `style={{...}}` случайно попал внутрь `className` при sed-замене, вынесен отдельно

---

### 4. Скрытая страница входа для сотрудников

**Файл:** `src/pages/StaffAuthPage.tsx`
**Маршрут:** `/staff` (не упоминается нигде на сайте)
- Тёмный дизайн, вход по OTP
- `shouldCreateUser: false` — новые аккаунты создать нельзя
- Редирект по роли: `admin`/`super_admin` → `/admin`, `affiliate_manager` → `/affiliate`

**Ссылка:** https://slot-home.ru/staff

---

### 5. Пользователь miltygang@yandex.ru

- **UUID:** `482be7d5-af73-4eae-bae1-9be26e27f98c`
- **Роль:** `affiliate_manager` — установлена вручную через Supabase SQL
- **Доступ:** кабинет `/affiliate`

---

### 6. Коммиты этой сессии

| Хэш | Описание |
|---|---|
| `c784abb` | Add affiliate manager cabinet (/affiliate) |
| `8e7800e` | Redesign admin + affiliate cabinets to dark SaaS UI, add CHANGELOG |
| `7c5d2ee` | fix: TypeScript build errors in affiliate cabinet |
| `827b6cb` | fix: malformed JSX in AdminOverviewPage skeleton |
| `70a169e` | feat: hidden staff login page at /staff |

---

### 7. TODO (не реализовано)

- [ ] Форма создания задач для аффилейтов в `/admin/settings` (вкладка есть, форма — нет)
- [ ] Логика выплат аффилейтам (поле «Ожидает выплаты» — заглушка)
- [ ] QR-код на странице реферальной ссылки
