import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function clearUserStatistics() {
  console.log("🗑️ Начинаем очистку статистики пользователей...");

  try {
    const deleteResult = await prisma.userStatistics.deleteMany({});

    console.log(`✅ Удалено ${deleteResult.count} записей статистики`);
    console.log("🎉 Очистка статистики завершена успешно!");

    return {
      deletedCount: deleteResult.count,
    };
  } catch (error) {
    console.error("❌ Ошибка при очистке статистики:", error);
    throw error;
  }
}

// Если файл запускается напрямую
clearUserStatistics()
  .then((result) => {
    console.log("✅ Очистка завершена успешно!");
    console.log(`🗑️ Удалено ${result.deletedCount} записей`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Ошибка выполнения очистки:", error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
