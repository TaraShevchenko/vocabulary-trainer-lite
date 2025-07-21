# Product Context: Vocabulary Trainer Lite

## Product Overview

Vocabulary Trainer Lite - веб-приложение для изучения английских слов с системой прогресса и различными типами упражнений.

## Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: tRPC + Prisma + PostgreSQL
- **Auth**: Clerk
- **Deployment**: Vercel + Neon
- **Architecture**: Feature-Sliced Design

## Core Features (Implemented)

✅ **Groups Management**: Управление группами слов с прогрессом
✅ **Exercise System**: Сопоставление, множественный выбор, ввод перевода
✅ **Progress Tracking**: Автоматическое отслеживание прогресса изучения
✅ **Favorites**: Система избранных групп
✅ **Authentication**: Полная интеграция с Clerk

## Current Enhancement Focus

**GroupsList Search & Sort** - улучшение UX для работы с группами слов:

- Поиск по названию групп
- Сортировка по избранным, дате создания, последней активности
- Адаптивный интерфейс

## User Journey Context

1. **Dashboard** → Пользователь видит список групп слов
2. **Group Selection** → Выбирает группу для изучения
3. **Exercise** → Выполняет упражнения
4. **Progress** → Видит свой прогресс

## Business Value of Current Task

- **Improved Discoverability**: Легче найти нужную группу слов
- **Better Organization**: Сортировка помогает приоритизировать изучение
- **Enhanced UX**: Снижение cognitive load при работе с большим количеством групп
- **User Retention**: Улучшенный UX повышает вовлеченность

## Quality Standards

- **Performance**: Debounced поиск, мемоизация
- **Accessibility**: WCAG compliance, keyboard navigation
- **Responsive**: Работа на всех устройствах
- **Type Safety**: Полная типизация TypeScript
