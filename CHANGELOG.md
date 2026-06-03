# CHANGELOG — slot-home.ru

## [2026-06-03] Кабинет аффилейт-менеджера + Dark SaaS UI редизайн

### Новое: Кабинет аффилейт-менеджера (`/affiliate`)

**База данных (Supabase — проект `qkhccmlrrhdfsjqnfyiu`)**
- `profiles` — добавлены колонки `affiliate_code TEXT UNIQUE`, `platform_commission_rate NUMERIC(5,4) DEFAULT 0.10`
- `performer_profiles` — добавлена колонка `affiliate_manager_id UUID REFERENCES auth.users(id)`
- Новая таблица `affiliate_tasks` — задачи от администратора для аффилейтов (title, description, priority, target, due_date)
- Новая таблица `affiliate_task_completions` — отметки о выполнении задач (task_id, affiliate_id)
- Новая таблица `affiliate_earnings_log` — лог начислений комиссий (order_id, performer_id, order_amount, platform_fee, affiliate_fee)
- RLS-политики: аффилейт видит только своих исполнителей, их заказы, чаты, задачи и свои начисления
- Триггер `trg_affiliate_earnings` — автоматически создаёт запись в `affiliate_earnings_log` при переводе заказа в статус `completed`
- Функция `record_affiliate_earnings()` — считает 15% от 10% от суммы заказа

**Роутинг** — добавлен блок `/affiliate/*` в `src/App.tsx`

**Файлы фронтенда:**
- `src/affiliate/types/index.ts` — типы: AffiliatePerformer, AffiliateOrder, AffiliateEarning, AffiliateTask, AffiliateStats, PRIORITY_LABELS, PRIORITY_COLORS
- `src/affiliate/lib/affiliateDb.ts` — DB-слой: загрузка статистики, исполнителей, заказов, начислений, задач; создание/выполнение задач; реферальный код
- `src/affiliate/store/affiliateStore.ts` — Zustand store
- `src/affiliate/components/AffiliateGuard.tsx` — проверка роли `affiliate_manager`
- `src/affiliate/components/layout/AffiliateLayout.tsx` — layout с сайдбаром
- `src/affiliate/components/layout/AffiliateSidebar.tsx` — боковая панель

**Страницы кабинета:**
- `/affiliate` — Обзор: 4 KPI-карточки (исполнители, заказы, заработок, споры)
- `/affiliate/performers` — Таблица исполнителей (read-only): имя, телефон, рейтинг, статус верификации, онлайн
- `/affiliate/orders` — Заказы исполнителей с фильтром по статусу (read-only, без кнопок изменения)
- `/affiliate/disputes` — Активные споры с кнопкой "Открыть чат"
- `/affiliate/chats` — Чаты типа `performer_admin` только своих исполнителей, полноценный ChatWindow
- `/affiliate/finance` — Таблица начислений с фильтром по периоду + KPI (итого, за месяц, ожидает выплаты)
- `/affiliate/tasks` — Задачник: карточки с приоритетом, дедлайном; кнопка выполнить/отменить
- `/affiliate/referral` — Реферальная ссылка, кнопка копировать, статистика привлечённых

**Реферальная регистрация:**
- `src/performer/pages/PerformerAuthPage.tsx` — при наличии `?ref=CODE` сохраняет код в `localStorage`
- `src/performer/onboarding/PerformerOnboarding.tsx` — после онбординга вызывает `affiliateLinkPerformerByCode()` и очищает localStorage

**Доступ ограничен:** аффилейт-менеджер НЕ видит:
- Логи ошибок и системные события
- Глобальные финансы платформы
- Настройки калькулятора и ставок
- Продуктовые метрики и аналитику
- Верификацию и управление клиентами

---

## [2026-06-03] Dark SaaS UI редизайн кабинетов

**Вдохновение:** https://saas-ui.dev/nextjs-starter-kit

**Общий стиль:**
- Фон: `#080a14` (основной), `#0c0e1a` (сайдбар), `#0f1120` (карточки)
- Карточки: `border border-white/[0.06]` вместо `border-gray-100`
- Таблицы: тёмный header `#0c0e1a`, разделители `divide-white/[0.04]`
- Текст: белый для заголовков, `#6b7194` для вторичного, `#a0a5c0` для данных

**Сайдбары (обновлены оба — Admin и Affiliate):**
- Добавлен поиск по разделам
- Active-пункт: мягкий синий highlight + левый акцент `#006AFF` (вместо solid-заливки)
- Аватар пользователя с инициалами в footer
- Иконка активного пункта окрашивается в `#006AFF`

**Обновлённые файлы:**
- `src/admin/components/layout/AdminSidebar.tsx`
- `src/admin/components/layout/AdminLayout.tsx`
- `src/affiliate/components/layout/AffiliateSidebar.tsx`
- `src/affiliate/components/layout/AffiliateLayout.tsx`
- Все страницы в `src/admin/pages/` и `src/affiliate/pages/`

---

## [2026-05-XX] Замена логотипа

- `public/logo-full.svg`, `logo-circle.svg`, `logo-square.svg` — новые SVG-файлы
- `public/favicon.svg` — заменён на circle-логотип
- Замена во всех компонентах: LandingPage, AuthPage, PerformerAuthPage, PerformerSidebar, Sidebar (dashboard), AdminSidebar, PublicHeader

---

## [2026-05-XX] Фирменные цвета (#006AFF)

- Заменено `bg-black`, `hover:bg-gray-800`, `border-black`, `focus:border-black` → синяя палитра `#006AFF / #004CB8`
- Тёмные секции лендинга: `bg-gray-900` → `bg-[#003B8F]`
- Спиннеры: `border-t-black` → `border-t-[#006AFF]`
- Ссылки: `text-black font-medium` → `text-[#006AFF] font-medium`

---

## [2026-05-XX] Исправления

- **Дисклеймер о цене** — `CheckoutStep.tsx` и `OrderDetailsPage.tsx`: добавлен текст о фиксированной стоимости и ссылка на поддержку
- **Отступ на страницах услуг** — `ServicePage.tsx`: `pt-30` → `pt-28` (убран наезд шапки)
- **Логотип в блоге** — `PublicHeader.tsx`: обновлён на новый SVG
