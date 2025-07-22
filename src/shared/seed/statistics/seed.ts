import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedUserStatistics() {
  console.log("📊 Начинаем заполнение базы данных статистикой...");

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });

    if (users.length === 0) {
      console.log(
        "⚠️ Пользователи не найдены. Сначала выполните сидинг пользователей.",
      );
      return;
    }

    console.log(`👥 Найдено ${users.length} пользователей`);

    let totalCreated = 0;

    for (const user of users) {
      console.log(`📈 Создаем статистику для пользователя: ${user.email}`);

      const statistics = [];

      for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(0, 0, 0, 0);

        const wordsAdded = Math.floor(Math.random() * 8) + 1;
        const wordsLearned = Math.floor(Math.random() * wordsAdded);
        const wordsRepeated = Math.floor(Math.random() * 3);

        const hasActivity = Math.random() > 0.3;

        if (hasActivity) {
          statistics.push({
            userId: user.id,
            date,
            wordsAdded,
            wordsLearned,
            wordsRepeated,
          });
        }
      }

      try {
        await prisma.userStatistics.createMany({
          data: statistics,
          skipDuplicates: true,
        });

        console.log(
          `✅ Создано ${statistics.length} записей статистики для ${user.email}`,
        );
        totalCreated += statistics.length;
      } catch (error) {
        console.warn(
          `⚠️ Ошибка при создании статистики для ${user.email}:`,
          error,
        );
      }
    }

    console.log(`\n📊 Результаты заполнения:`);
    console.log(`✅ Всего создано записей статистики: ${totalCreated}`);
    console.log(`👥 Обработано пользователей: ${users.length}`);
    console.log(`🎉 Заполнение статистикой завершено успешно!`);

    return {
      totalCreated,
      usersProcessed: users.length,
    };
  } catch (error) {
    console.error("❌ Ошибка при заполнении статистикой:", error);
    throw error;
  }
}

// Если файл запускается напрямую
seedUserStatistics()
  .then((result) => {
    console.log("✅ Seed скрипт выполнен успешно");
    if (result) {
      console.log(
        `📊 Итого: создано ${result.totalCreated} записей для ${result.usersProcessed} пользователей`,
      );
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Ошибка выполнения seed скрипта:", error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
