# 🎓 Vocabulary Trainer Lite

> Современное приложение для изучения английских слов с интерактивными упражнениями и системой прогресса

## 📋 Описание

Vocabulary Trainer Lite - это веб-приложение для изучения английского языка, которое предоставляет пользователям персонализированный опыт обучения через различные типы интерактивных упражнений. Приложение отслеживает прогресс изучения каждого слова и адаптирует содержание в зависимости от успехов пользователя.

## ✨ Основные возможности

### 🎯 Три типа упражнений

1. **Сопоставление** - Перетаскивание английских слов к их русским переводам
2. **Множественный выбор** - Выбор правильного перевода из 4 вариантов
3. **Ввод перевода** - Написание английского слова по русскому переводу

### 📊 Умная система прогресса

- **Динамическое изменение**: +10% за правильный ответ, -5% за неправильный
- **Дневные ограничения**: максимум +50% прогресса в день
- **Автоматическое снижение**: -10% каждые 2 дня для поддержания активности
- **Завершенные слова**: слова со 100% прогрессом исключаются из упражнений

### 👤 Персонализация

- Индивидуальные группы слов для каждого пользователя
- Отслеживание личного прогресса
- Безопасная аутентификация через Clerk

## 🛠 Технический стек

### Frontend
- **Next.js 15** - React фреймворк с App Router
- **React 19** - Пользовательский интерфейс
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Radix UI** - Компоненты интерфейса
- **React Hook Form + Zod** - Формы и валидация


### Backend
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - Основная база данных
- **Server Actions** - Серверная логика
- **Clerk** - Аутентификация и управление пользователями

### Инфраструктура
- **Vercel** - Хостинг и деплой
- **Neon** - Управляемая PostgreSQL база данных

## 🏗 Архитектура

### Feature-Sliced Design

Проект организован по принципам Feature-Sliced Design:

```
src/
├── app/                    # Next.js App Router
├── modules/                # Бизнес-логика по модулям
│   ├── groups/            # Управление группами слов
│   ├── words/             # Работа со словами
│   └── exercises/         # Система упражнений
├── shared/                # Общие компоненты и утилиты
│   ├── api/              # API утилиты
│   ├── ui/               # UI компоненты
│   ├── utils/            # Вспомогательные функции
│   └── types/            # Общие типы
└── widgets/              # Составные компоненты
```

### Модель данных

```mermaid
erDiagram
    User ||--o{ WordGroup : owns
    User ||--o{ UserWordProgress : tracks
    User ||--o{ ExerciseSession : participates
    
    WordGroup ||--o{ Word : contains
    Word ||--o{ UserWordProgress : has
    
    ExerciseSession ||--o{ ExerciseResult : includes
    Word ||--o{ ExerciseResult : tested_in
    
    User {
        string id PK
        string clerkId
        string email
        datetime createdAt
        datetime updatedAt
    }
    
    WordGroup {
        string id PK
        string name
        string description
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Word {
        string id PK
        string english
        string russian
        string wordGroupId FK
        datetime createdAt
        datetime updatedAt
    }
    
    UserWordProgress {
        string id PK
        string userId FK
        string wordId FK
        int progress
        datetime lastStudied
        datetime lastProgressUpdate
        int dailyProgressGain
        datetime createdAt
        datetime updatedAt
    }
    
    ExerciseSession {
        string id PK
        string userId FK
        string wordGroupId FK
        string exerciseType
        datetime startedAt
        datetime completedAt
        int totalWords
        int correctAnswers
    }
    
    ExerciseResult {
        string id PK
        string sessionId FK
        string wordId FK
        boolean isCorrect
        int progressChange
        datetime answeredAt
    }
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- PostgreSQL база данных
- Аккаунт Clerk для аутентификации

### Установка

1. **Клонирование репозитория**
   ```bash
   git clone <repository-url>
   cd vocabulary-trainer-lite
   ```

2. **Установка зависимостей**
   ```bash
   npm install
   ```

3. **Настройка переменных окружения**
   
   Создайте файл `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/vocabulary_trainer"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

4. **Настройка базы данных**
   ```bash
   # Применение миграций
   npx prisma migrate dev
   
   # Заполнение тестовыми данными
   npm run seed:users
   npm run seed:words
   ```

5. **Запуск приложения**
   ```bash
   npm run dev
   ```

   Приложение будет доступно по адресу `http://localhost:3000`

## 📝 Доступные скрипты

```bash
# Разработка
npm run dev              # Запуск в режиме разработки
npm run build            # Сборка для продакшена
npm run start            # Запуск продакшен сборки
npm run lint             # Проверка кода линтером

# База данных
npm run db:migrate       # Применение миграций
npm run db:reset         # Сброс базы данных
npm run db:seed          # Заполнение тестовыми данными
npm run seed:users       # Заполнение пользователями
npm run seed:words       # Заполнение словами

# Разработка с ngrok
npm run dev:ngrok        # Запуск с внешним доступом
```

## 🎮 Использование

### Для пользователей

1. **Регистрация/Вход** - Создайте аккаунт или войдите через Clerk
2. **Выбор группы слов** - На главной странице выберите группу для изучения
3. **Выполнение упражнений** - Выберите тип упражнения и начните изучение
4. **Отслеживание прогресса** - Следите за своими успехами в изучении

### Для администраторов

**Добавление новых слов и групп:**

Слова и группы добавляются через seed скрипты или напрямую в базу данных:

```sql
-- Создание группы слов
INSERT INTO "WordGroup" (id, name, description, "userId") 
VALUES ('group-id', 'Базовая лексика', 'Основные английские слова', 'user-id');

-- Добавление слов
INSERT INTO "Word" (id, english, russian, "wordGroupId") 
VALUES 
  ('word-1', 'hello', 'привет', 'group-id'),
  ('word-2', 'world', 'мир', 'group-id');
```

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# Тесты с покрытием
npm run test:coverage

# E2E тесты
npm run test:e2e
```

## 📊 Система прогресса

### Алгоритм изменения прогресса

```typescript
function updateProgress(currentProgress: number, isCorrect: boolean, dailyGain: number): number {
  const change = isCorrect ? 10 : -5;
  
  // Проверка дневного лимита
  if (isCorrect && dailyGain >= 50) {
    return currentProgress; // Лимит достигнут
  }
  
  const newProgress = Math.max(0, Math.min(100, currentProgress + change));
  return newProgress;
}
```

### Автоматическое снижение

Каждые 2 дня прогресс автоматически снижается на 10% для поддержания активности изучения.

## 🔧 Конфигурация

### Настройка Clerk

1. Создайте приложение в [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Настройте провайдеры аутентификации
3. Добавьте домен приложения в настройки
4. Скопируйте ключи в `.env.local`

### Настройка базы данных

Для продакшена рекомендуется использовать [Neon](https://neon.tech/) или другой управляемый PostgreSQL сервис.

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой произойдет автоматически

### Другие платформы

Приложение совместимо с любой платформой, поддерживающей Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Участие в разработке

### Структура коммитов

```
feat: добавить новый тип упражнения
fix: исправить расчет прогресса
docs: обновить README
style: улучшить стили компонентов
refactor: оптимизировать запросы к БД
test: добавить тесты для системы прогресса
```

### Процесс разработки

1. Создайте ветку для новой функции
2. Внесите изменения с тестами
3. Убедитесь, что все тесты проходят
4. Создайте Pull Request

## 📈 Планы развития

### Ближайшие обновления
- [ ] Мобильное приложение (React Native)
- [ ] Система достижений
- [ ] Социальные функции (соревнования)
- [ ] Поддержка других языков
- [ ] Голосовые упражнения
- [ ] Интеграция с внешними словарями

### Долгосрочные цели
- [ ] ИИ-помощник для персонализации
- [ ] Адаптивные алгоритмы обучения
- [ ] Интеграция с образовательными платформами
- [ ] Корпоративные решения

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [Issues](../../issues) на GitHub
2. Создайте новый Issue с подробным описанием
3. Для срочных вопросов свяжитесь с командой разработки

## 🙏 Благодарности

- [Next.js](https://nextjs.org/) - за отличный React фреймворк
- [Clerk](https://clerk.dev/) - за простую аутентификацию
- [Prisma](https://prisma.io/) - за удобную работу с базой данных
- [Radix UI](https://radix-ui.com/) - за качественные компоненты
- [Vercel](https://vercel.com/) - за платформу деплоя

---

**Создано с ❤️ для изучения английского языка**