import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Очищает все данные о словах и группах из базы данных
 * Удаляет в правильном порядке с учетом связей между таблицами
 */
export async function clearWordsAndGroups() {
  console.log("🧹 Начинаем очистку данных о словах и группах...");

  try {
    // Удаляем в правильном порядке из-за внешних ключей
    console.log("🗑️ Удаляем записи прогресса...");
    const deletedProgress = await prisma.progress.deleteMany({});
    console.log(`✅ Удалено записей прогресса: ${deletedProgress.count}`);

    console.log("🗑️ Удаляем слова...");
    const deletedWords = await prisma.word.deleteMany({});
    console.log(`✅ Удалено слов: ${deletedWords.count}`);

    console.log("🗑️ Удаляем группы слов...");
    const deletedGroups = await prisma.wordGroup.deleteMany({});
    console.log(`✅ Удалено групп: ${deletedGroups.count}`);

    console.log("🎉 Очистка завершена успешно!");

    return {
      deletedProgress: deletedProgress.count,
      deletedWords: deletedWords.count,
      deletedGroups: deletedGroups.count,
    };
  } catch (error) {
    console.error("❌ Ошибка при очистке данных:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Если файл запускается напрямую
clearWordsAndGroups()
  .then((result) => {
    console.log("✅ Очистка выполнена успешно:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Ошибка выполнения очистки:", error);
    process.exit(1);
  });
