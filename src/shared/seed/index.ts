// Экспорт основных seed функций
// Пользователи
export { syncClerkUsersToDatabase } from "./users/seed";
export { clearUsersFromDatabase } from "./users/clear";

// Слова и группы
export { seedWordsAndGroups } from "./words/seed";
export { clearWordsAndGroups } from "./words/clear";

// Статистика
export { clearUserStatistics } from "./statistics/clear";

// Экспорт данных для использования в других частях приложения
