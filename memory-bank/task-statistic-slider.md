# Задача: Замена статистической карточки на интерактивный слайдер

## Описание

Заменить существующую статистическую карточку в GroupsList на интерактивный слайдер с тремя слайдами:

1. **Глобальная статистика** - статистика за все время
2. **Стрик статистика** - статистика за последние дни без пропусков
3. **Сегодняшняя статистика** - статистика за сегодня

Слайдер должен работать в loop режиме (с 3-го слайда можно перейти на 1-й). Логика активного слайда:

- Если есть стрик → активен 2-й слайд (стрик)
- Если нет стрика → активен 3-й слайд (сегодня)

Во всех слайдах вместо текущих полей будут отображаться:

- **Слов добавлено**
- **Слов выучено**
- **Слов на повторении**

## Complexity

Level: 3
Type: Intermediate Feature

## Technology Stack

- Framework: Next.js 15 с App Router
- Language: TypeScript + React 19
- Styling: Tailwind CSS
- State Management: React useState (локальное состояние)
- UI Components: Radix UI + shadcn/ui
- Animation: CSS transitions или Framer Motion
- API: tRPC (возможно новые роуты для статистики)

## Technology Validation Checkpoints

- [x] Project initialization command verified (проект уже работает)
- [x] Required dependencies identified and installed (базовые зависимости есть)
- [ ] Animation library selected and configured (если нужна)
- [ ] API endpoints for statistics verified/created
- [x] Build configuration validated (проект компилируется)
- [ ] Component structure proof of concept created
- [ ] Test build with new components passes

## Status

- [x] Initialization complete
- [x] Planning complete
- [ ] Creative phase complete (UI/UX design)
- [ ] Implementation complete
- [ ] Testing complete

## Requirements Analysis

### Функциональные требования

1. **Слайдер с тремя слайдами**

   - Слайд 1: Глобальная статистика (за все время)
   - Слайд 2: Стрик статистика (текущий стрик без пропусков)
   - Слайд 3: Сегодняшняя статистика

2. **Навигация между слайдами**

   - Кнопки навигации (влево/вправо)
   - Индикаторы текущего слайда (dots)
   - Loop навигация (с 3-го на 1-й и наоборот)
   - Swipe поддержка на мобильных устройствах

3. **Логика активного слайда**

   - При наличии стрика: активен слайд 2 (стрик)
   - При отсутствии стрика: активен слайд 3 (сегодня)

4. **Контент слайдов**
   - Каждый слайд показывает: Слов добавлено, Слов выучено, Слов на повторении
   - Разные источники данных для каждого слайда

### Нефункциональные требования

1. **Производительность** - плавные анимации переходов
2. **Адаптивность** - работа на мобильных устройствах
3. **Доступность** - keyboard navigation, screen readers
4. **Визуальная согласованность** - соответствие существующему дизайну

## Components Affected

### Основные компоненты

1. **GroupsList.tsx** - замена существующей статистической карточки
2. **StatisticsSlider.tsx** (новый) - основной слайдер компонент
3. **StatisticsSlide.tsx** (новый) - отдельный слайд компонент
4. **SliderNavigation.tsx** (новый) - навигационные элементы

### Дополнительные компоненты

1. **hooks/useStatistics.ts** (новый) - хук для получения данных статистики
2. **hooks/useSlider.ts** (новый) - логика управления слайдером
3. **types/statistics.ts** (новый) - типы для статистики

## Architecture Considerations

### Структура данных статистики

```typescript
interface StatisticsData {
  global: {
    wordsAdded: number;
    wordsLearned: number;
    wordsInReview: number;
  };
  streak: {
    wordsAdded: number;
    wordsLearned: number;
    wordsInReview: number;
    streakDays: number;
    hasActiveStreak: boolean;
  };
  today: {
    wordsAdded: number;
    wordsLearned: number;
    wordsInReview: number;
  };
}
```

### Слайдер состояние

```typescript
interface SliderState {
  currentSlide: number; // 0, 1, 2
  isTransitioning: boolean;
  direction: "left" | "right";
}
```

## Implementation Strategy

### Фаза 1: Создание базовой структуры слайдера

1. Создать StatisticsSlider компонент с базовой структурой
2. Реализовать StatisticsSlide компонент для отображения данных
3. Добавить базовое состояние и навигацию
4. Заменить существующую карточку в GroupsList

### Фаза 2: Реализация логики данных

1. Создать типы для статистических данных
2. Реализовать useStatistics хук
3. Добавить API endpoints для получения статистики (если нужно)
4. Интегрировать данные в слайдер

### Фаза 3: Анимации и переходы

1. Добавить CSS transitions для плавных переходов
2. Реализовать swipe жесты для мобильных устройств
3. Добавить индикаторы загрузки
4. Оптимизировать производительность анимаций

### Фаза 4: Логика активного слайда и UX

1. Реализовать логику определения активного слайда по стрику
2. Добавить навигационные элементы (кнопки, dots)
3. Реализовать keyboard navigation
4. Добавить поддержку accessibility

### Фаза 5: Финализация и полировка

1. Стилизация в соответствии с существующим дизайном
2. Адаптивность для мобильных устройств
3. Тестирование всех сценариев
4. Code review и оптимизация

## Detailed Steps

### 1. Структура файлов

```
src/modules/groups/ui/
├── GroupsList.tsx (модификация)
├── statistics/
│   ├── StatisticsSlider.tsx
│   ├── StatisticsSlide.tsx
│   ├── SliderNavigation.tsx
│   └── index.ts

src/modules/groups/hooks/
├── useStatistics.ts
└── useSlider.ts

src/modules/groups/types/
└── statistics.ts
```

### 2. API изменения (если нужно)

- Проанализировать доступные данные в существующих API
- Создать новые tRPC роуты для статистики по периодам
- Добавить вычисление стрика в backend

### 3. Компонентная архитектура

```
StatisticsSlider
├── SliderContainer
│   ├── StatisticsSlide (Global)
│   ├── StatisticsSlide (Streak)
│   └── StatisticsSlide (Today)
└── SliderNavigation
    ├── NavigationButtons
    └── SlideIndicators
```

## Creative Phases Required

- [ ] **🎨 UI/UX Design** - дизайн слайдера, анимаций и переходов
- [ ] **🏗️ Component Architecture** - структура компонентов и их взаимодействие
- [ ] **⚙️ Data Architecture** - структура данных статистики и API интеграция

## Dependencies

### Внутренние

- Существующие tRPC роуты groups.\*
- Существующие UI компоненты (Card, Button)
- Система типов TypeScript

### Внешние

- shadcn/ui компоненты
- Tailwind CSS для стилизации
- Возможно Framer Motion для анимаций
- React hooks (useState, useEffect, useMemo)

### Новые зависимости (если нужны)

- Библиотека для swipe жестов (react-swipeable)
- Библиотека анимаций (framer-motion) - опционально

## Challenges & Mitigations

### Challenge 1: Данные для стрик статистики

**Описание**: Возможно отсутствие данных о ежедневной активности пользователя
**Mitigation**:

- Проанализировать существующую схему БД
- Добавить tracking ежедневной активности если нужно
- Создать fallback логику если данных нет

### Challenge 2: Плавные анимации на слабых устройствах

**Описание**: Анимации могут тормозить на старых мобильных устройствах
**Mitigation**:

- Использовать CSS transforms вместо изменения layout
- Добавить опцию отключения анимаций
- Использовать will-change CSS property аккуратно

### Challenge 3: Сложность state management слайдера

**Описание**: Управление состоянием слайдера с loop навигацией может быть сложным
**Mitigation**:

- Создать dedicated useSlider hook
- Использовать reducer pattern для сложной логики
- Добавить comprehensive unit tests

### Challenge 4: Мобильная адаптивность с swipe жестами

**Описание**: Интеграция swipe жестов может конфликтовать с scroll
**Mitigation**:

- Использовать proven библиотеки (react-swipeable)
- Правильно настроить event handling
- Тестировать на реальных устройствах

### Challenge 5: Accessibility для слайдера

**Описание**: Слайдеры могут быть сложными для screen readers
**Mitigation**:

- Использовать proper ARIA attributes
- Обеспечить keyboard navigation
- Добавить announcements при смене слайда

## Testing Strategy

### Unit Testing

- Логика useSlider hook
- Вычисления статистики в useStatistics
- Компонентные тесты для каждого слайда

### Integration Testing

- Взаимодействие между слайдером и API
- Навигация между слайдами
- Обработка edge cases (нет данных, ошибки API)

### Manual Testing

- Тестирование на разных размерах экрана
- Проверка swipe жестов на мобильных
- Keyboard navigation testing
- Screen reader compatibility

### Performance Testing

- Проверка плавности анимаций
- Тестирование на слабых устройствах
- Профилирование rendering performance

## Acceptance Criteria

### Функциональность

- [ ] Слайдер содержит 3 слайда с корректным контентом
- [ ] Навигация работает в loop режиме (3→1, 1→3)
- [ ] Активный слайд определяется по наличию стрика
- [ ] Все слайды показывают: слов добавлено, выучено, на повторении
- [ ] Плавные анимации переходов между слайдами

### Интерактивность

- [ ] Кнопки навигации (влево/вправо) работают корректно
- [ ] Индикаторы слайдов (dots) показывают текущий слайд
- [ ] Swipe жесты работают на мобильных устройствах
- [ ] Keyboard navigation (стрелки, Tab) функционирует

### UX и дизайн

- [ ] Дизайн соответствует существующему стилю приложения
- [ ] Компонент адаптивен для мобильных устройств
- [ ] Состояния загрузки и ошибок обработаны корректно
- [ ] Accessibility требования выполнены (ARIA, screen readers)

### Производительность

- [ ] Анимации плавные на всех устройствах
- [ ] Нет memory leaks при unmount компонента
- [ ] Быстрое переключение между слайдами
- [ ] Корректная работа с большими объемами данных

## Next Steps

После завершения implementation:

1. **Code Review** - проверка архитектуры и code quality
2. **Cross-browser Testing** - тестирование на разных браузерах
3. **Performance Optimization** - профилирование и оптимизация
4. **User Testing** - получение feedback от пользователей
5. **Documentation** - обновление документации компонентов
6. **Future Enhancements** - планирование дополнительных фич (например, кастомизация слайдов)

## Technical Implementation Notes

### Слайдер механика

```typescript
// Базовая логика навигации с loop
const nextSlide = () => {
  setCurrentSlide((prev) => (prev + 1) % 3);
};

const prevSlide = () => {
  setCurrentSlide((prev) => (prev - 1 + 3) % 3);
};
```

### Определение активного слайда

```typescript
const getInitialSlide = (hasStreak: boolean) => {
  return hasStreak ? 1 : 2; // 1=streak, 2=today
};
```

### CSS для transitions

```css
.slider-container {
  transform: translateX(-${currentSlide * 100}%);
  transition: transform 300ms ease-in-out;
}
```
