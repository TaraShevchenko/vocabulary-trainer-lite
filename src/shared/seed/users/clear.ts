import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Очищает всех пользователей из локальной базы данных PostgreSQL
 * НЕ затрагивает данные в Clerk - только локальную базу данных
 */
async function clearUsersFromDatabase() {
  console.log("🧹 Начинаем очистку пользователей из локальной базы данных...");
  console.log("ℹ️ Данные в Clerk НЕ будут затронуты");

  try {
    // Получаем количество пользователей перед удалением
    const userCount = await prisma.user.count();
    console.log(`📊 Найдено ${userCount} пользователей в базе данных`);

    if (userCount === 0) {
      console.log("ℹ️ База данных уже пуста - нечего удалять");
      return { deleted: 0 };
    }

    // Удаляем всех пользователей из локальной базы данных
    console.log("🗑️ Удаляем всех пользователей из PostgreSQL...");
    const deleteResult = await prisma.user.deleteMany({});

    console.log(
      `✅ Успешно удалено ${deleteResult.count} пользователей из базы данных`,
    );
    console.log("ℹ️ Пользователи в Clerk остались нетронутыми");
    console.log(
      "💡 Для восстановления данных запустите: npm run db:seed:users",
    );

    return { deleted: deleteResult.count };
  } catch (error) {
    console.error("❌ Ошибка при очистке пользователей:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Основная функция для запуска очистки
 */
async function main() {
  try {
    console.log("🚀 Запуск очистки пользователей из локальной базы данных...");

    const result = await clearUsersFromDatabase();

    console.log("\n🎉 Очистка завершена успешно!");
    console.log(`📊 Удалено пользователей: ${result.deleted}`);
  } catch (error) {
    console.error("💥 Критическая ошибка:", error);
    process.exit(1);
  }
}

// Запускаем очистку если файл запущен напрямую
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export { clearUsersFromDatabase };
