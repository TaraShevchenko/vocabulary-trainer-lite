# Задача: Добавление поиска, сортировки и пагинации в GroupsList

## Описание

Добавить функциональность поиска, сортировки и серверной пагинации с infinite scroll в компонент GroupsList.tsx для улучшения производительности и пользовательского опыта при работе с группами слов.

## Complexity

Level: 3
Type: Intermediate Feature

## Technology Stack

- Framework: Next.js 15 с App Router
- Language: TypeScript + React 19
- Styling: Tailwind CSS
- State Management: tRPC infinite queries
- UI Components: Radix UI + shadcn/ui
- API: tRPC (новые роуты с пагинацией)
- Database: Prisma ORM

## Technology Validation Checkpoints

- [x] Project initialization command verified (проект уже работает)
- [x] Required dependencies identified and installed (все зависимости уже есть)
- [x] Build configuration validated (проект компилируется)
- [x] Hello world verification completed (GroupsList уже работает)
- [x] Test build passes successfully (npm run build проходит)

## Status

- [x] Initialization complete
- [x] Planning complete
- [x] Implementation complete
- [x] Testing complete

## Requirements Analysis

1. **Серверная пагинация** - загрузка групп по 10 штук для улучшения производительности
2. **Infinite scroll** - автоматическая подгрузка при скролле
3. **Поиск через API** - серверный поиск по названию группы для лучшей производительности
4. **Сортировка через API** - серверная сортировка по избранным, недавно добавленным, алфавиту
5. **Лоадер при загрузке** - индикатор загрузки новых записей
6. **Отзывчивый интерфейс** - элементы управления должны хорошо работать на мобильных устройствах

## Implementation Plan

### 1. Обновление API (Backend)

**Файлы для изменения:**

- `src/modules/groups/model/router.groups.ts` - новая процедура getPaginated

**Подзадачи:**

- [x] Создать новую процедуру getPaginated с параметрами limit, cursor, search, sortBy
- [x] Реализовать cursor-based пагинацию
- [x] Добавить поиск по названию группы (case-insensitive)
- [x] Реализовать сортировку на сервере (избранные, недавно добавленные, алфавит)
- [x] Оптимизировать запросы к БД с правильными include и orderBy
- [x] Вернуть nextCursor для следующей страницы
- [x] Добавить totalCount только для первой страницы

### 2. Создание хуков для infinite scroll

**Подзадачи:**

- [x] Создать хук useInfiniteScroll с Intersection Observer
- [x] Добавить параметры hasNextPage, isFetchingNextPage, fetchNextPage
- [x] Настроить threshold и rootMargin для оптимальной загрузки
- [x] Возвращать ref для элемента-триггера

### 3. Создание UI компонентов

**Подзадачи:**

- [x] Создать компонент Spinner для индикации загрузки
- [x] Добавить размеры sm, md, lg для спиннера
- [x] Стилизовать с помощью Tailwind CSS

### 4. Обновление GroupsList компонента

**Подзадачи:**

- [x] Заменить useQuery на useInfiniteQuery
- [x] Интегрировать серверный поиск с debounce
- [x] Добавить серверную сортировку
- [x] Реализовать infinite scroll с автозагрузкой
- [x] Добавить лоадеры для разных состояний
- [x] Обработать состояния ошибок

### 5. Улучшение UX

**Подзадачи:**

- [x] Показать спиннер в конце списка при загрузке новых данных
- [x] Счетчик найденных результатов с totalCount
- [x] Правильная обработка состояния "ничего не найдено"
- [x] Сохранение состояния поиска и сортировки
- [x] Responsive дизайн для мобильных устройств

## Implementation Details

### Реализованные файлы:

1. **src/modules/groups/model/router.groups.ts** - Обновленный роутер

   - Добавлена процедура `getPaginated` с cursor-based пагинацией
   - Серверный поиск с Prisma `contains` и `mode: "insensitive"`
   - Серверная сортировка с разными orderBy стратегиями
   - Оптимизированные запросы с include только нужных данных
   - totalCount возвращается только для первой страницы

2. **src/shared/hooks/useInfiniteScroll.ts** - Хук для infinite scroll

   - Использует Intersection Observer API
   - Настройки threshold: 0.1, rootMargin: "100px"
   - Автоматическая загрузка при приближении к концу списка

3. **src/shared/ui/spinner.tsx** - Компонент спиннера

   - Поддержка размеров sm, md, lg
   - Анимация с CSS animation (animate-spin)
   - Accessibility с role="status" и aria-label

4. **src/modules/groups/ui/GroupsList.tsx** - Обновленный компонент

   - Использует `api.groups.getPaginated.useInfiniteQuery`
   - Серверный поиск и сортировка
   - Infinite scroll с автозагрузкой
   - Лоадеры для разных состояний
   - Обработка ошибок

5. **src/shared/hooks/index.ts** - Обновленный экспорт хуков

### API Структура:

#### Новая процедура getPaginated:

```typescript
getPaginated: protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(50).default(10),
      cursor: z.number().optional(),
      search: z.string().optional(),
      sortBy: SortOption.default("favorites"),
    }),
  )
  .query(async ({ input, ctx }) => {
    // ... реализация
    return {
      groups: groupsWithStats,
      nextCursor,
      totalCount, // только для первой страницы
    };
  });
```

#### Типы сортировки:

```typescript
const SortOption = z.enum(["favorites", "newest", "alphabetical"]);
```

### Frontend реализация:

#### Infinite Query:

```typescript
const {
  data,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  error,
} = api.groups.getPaginated.useInfiniteQuery(
  {
    limit: 10,
    search: debouncedSearchQuery || undefined,
    sortBy: sortOption,
  },
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
  },
);
```

#### Infinite Scroll Hook:

```typescript
const { loadMoreRef } = useInfiniteScroll({
  hasNextPage: !!hasNextPage,
  isFetchingNextPage,
  fetchNextPage: () => void fetchNextPage(),
});
```

## Technology Implementation Details

### Database Optimization

- **Cursor-based pagination**: Более эффективная для больших наборов данных
- **Selective includes**: Загружаем только нужные связанные данные
- **Server-side filtering**: Поиск выполняется на сервере для лучшей производительности
- **Indexed ordering**: Используем существующие индексы для сортировки

### Performance Optimizations

- **Debounced search**: 300ms задержка для уменьшения API запросов
- **Infinite scroll**: Загрузка по требованию вместо загрузки всех данных
- **Query invalidation**: Обновление кэша только при необходимости
- **Intersection Observer**: Эффективное отслеживание скролла

## Dependencies

- **Внутренние**:
  - Новый tRPC роутер groups.getPaginated
  - useInfiniteQuery из @tanstack/react-query
  - Intersection Observer API
- **Внешние**: shadcn/ui компоненты (Input, Select, Button, Spinner)
- **Hooks**: useState, useInfiniteScroll, useDebounce

## Testing Strategy

1. **API testing**: Тестирование пагинации, поиска и сортировки
2. **Performance testing**: Проверка с большим количеством групп
3. **Infinite scroll testing**: Автозагрузка при скролле
4. **Edge cases**: Пустые результаты, ошибки сети
5. **Mobile testing**: Responsive поведение на мобильных устройствах

## Build Status

✅ **BUILD COMPLETE**

- [x] Сборка проходит без ошибок (npm run build успешен)
- [x] TypeScript типы корректны
- [x] Линтер не выдает ошибок
- [x] Все новые компоненты и хуки работают

## Acceptance Criteria

- [x] Пользователи видят только 10 групп при первой загрузке
- [x] Новые группы загружаются автоматически при скролле
- [x] Показывается лоадер при загрузке новых записей
- [x] Поиск выполняется на сервере с debounce
- [x] Сортировка работает на сервере мгновенно
- [x] Интерфейс адаптивен для мобильных устройств
- [x] Показывается общее количество найденных результатов
- [x] Корректная обработка состояний загрузки и ошибок
- [x] Оптимальная производительность с большими наборами данных

## Performance Improvements

### До реализации:

- Загрузка всех групп сразу
- Клиентская фильтрация и сортировка
- Медленная работа с большим количеством данных

### После реализации:

- Загрузка по 10 записей
- Серверная фильтрация и сортировка
- Infinite scroll для плавной подгрузки
- Оптимизированные DB запросы
- Кэширование с tRPC

## Next Steps

**→ TASK COMPLETE**

Функциональность серверной пагинации с infinite scroll, поиском и сортировкой успешно реализована. Приложение теперь эффективно работает с любым количеством групп, обеспечивая отличную производительность и пользовательский опыт.
