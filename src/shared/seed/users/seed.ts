import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";
import { env } from "@/shared/config/env.js";

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

/**
 * Синхронизирует пользователей из Clerk с базой данных
 * Получает всех пользователей из Clerk и создает их в локальной базе данных
 */
export async function syncClerkUsersToDatabase() {
  console.log("🔄 Начинаем синхронизацию пользователей из Clerk...");

  try {
    // Получаем всех пользователей из Clerk
    console.log("📡 Запрашиваем пользователей из Clerk API...");
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 100, // Можно увеличить при необходимости
    });

    console.log(`📊 Найдено ${clerkUsers.data.length} пользователей в Clerk`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const clerkUser of clerkUsers.data) {
      try {
        // Проверяем есть ли email у пользователя
        const primaryEmail = clerkUser.emailAddresses.find(
          (email) => email.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress;

        if (!primaryEmail) {
          console.warn(
            `⚠️ Пользователь ${clerkUser.id} не имеет email адреса, пропускаем`,
          );
          skippedCount++;
          continue;
        }

        // Проверяем существует ли пользователь в нашей базе
        const existingUser = await prisma.user.findUnique({
          where: { id: clerkUser.id },
        });

        const userData = {
          email: primaryEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          name:
            clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.firstName || clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl,
          username: clerkUser.username,
          clerkCreatedAt: new Date(clerkUser.createdAt),
          clerkUpdatedAt: new Date(clerkUser.updatedAt),
        };

        if (existingUser) {
          // Обновляем существующего пользователя
          await prisma.user.update({
            where: { id: clerkUser.id },
            data: userData,
          });

          console.log(
            `🔄 Обновлен пользователь: ${userData.name || userData.email} (${clerkUser.id})`,
          );
          updatedCount++;
        } else {
          // Создаем нового пользователя
          await prisma.user.create({
            data: {
              id: clerkUser.id,
              ...userData,
            },
          });

          console.log(
            `✅ Создан пользователь: ${userData.name || userData.email} (${clerkUser.id})`,
          );
          createdCount++;
        }
      } catch (userError) {
        console.error(
          `❌ Ошибка при обработке пользователя ${clerkUser.id}:`,
          userError,
        );
        skippedCount++;
      }
    }

    console.log("\n📈 Результаты синхронизации:");
    console.log(`✅ Создано новых пользователей: ${createdCount}`);
    console.log(`🔄 Обновлено существующих: ${updatedCount}`);
    console.log(`⚠️ Пропущено: ${skippedCount}`);
    console.log(
      `📊 Всего обработано: ${createdCount + updatedCount + skippedCount}`,
    );

    return {
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      total: createdCount + updatedCount + skippedCount,
    };
  } catch (error) {
    console.error("❌ Ошибка при синхронизации пользователей:", error);
    throw error;
  }
}

/**
 * Основная функция для запуска синхронизации
 */
async function main() {
  try {
    console.log(
      "🚀 Запуск синхронизации пользователей Clerk с базой данных...",
    );

    const result = await syncClerkUsersToDatabase();

    console.log("\n🎉 Синхронизация завершена успешно!");
    console.log(
      `📊 Итого: создано ${result.created}, обновлено ${result.updated}, пропущено ${result.skipped}`,
    );
  } catch (error) {
    console.error("💥 Критическая ошибка:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем синхронизацию если файл запущен напрямую
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
