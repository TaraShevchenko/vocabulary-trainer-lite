import { db } from "@/shared/api/db";
import { createTRPCRouter, protectedProcedure } from "@/shared/api/trpc";

export const statisticsRouter = createTRPCRouter({
  getOverall: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Получаем общую статистику пользователя
    const stats = await db.userStatistics.aggregate({
      where: {
        userId,
      },
      _sum: {
        wordsAdded: true,
        wordsLearned: true,
        wordsRepeated: true,
      },
    });

    return {
      wordsAdded: stats._sum.wordsAdded || 0,
      wordsLearned: stats._sum.wordsLearned || 0,
      wordsInReview: stats._sum.wordsRepeated || 0,
    };
  }),

  getToday: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Получаем статистику за сегодня
    const todayStats = await db.userStatistics.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    return {
      wordsAdded: todayStats?.wordsAdded || 0,
      wordsLearned: todayStats?.wordsLearned || 0,
      wordsInReview: todayStats?.wordsRepeated || 0,
    };
  }),

  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Получаем все записи статистики пользователя, отсортированные по дате в убывающем порядке
    const userStats = await db.userStatistics.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });

    if (userStats.length === 0) {
      return {
        wordsAdded: 0,
        wordsLearned: 0,
        wordsInReview: 0,
        streakDays: 0,
        hasActiveStreak: false,
      };
    }

    // Проверяем, есть ли активный стрик
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Активный стрик есть, если последняя запись была сегодня или вчера
    const lastRecord = userStats[0]!;
    const lastRecordDate = new Date(lastRecord.date);
    const hasActiveStreak =
      lastRecordDate.getTime() === today.getTime() ||
      lastRecordDate.getTime() === yesterday.getTime();

    if (!hasActiveStreak) {
      return {
        wordsAdded: 0,
        wordsLearned: 0,
        wordsInReview: 0,
        streakDays: 0,
        hasActiveStreak: false,
      };
    }

    // Подсчитываем длину стрика
    let streakDays = 0;

    // Начинаем с последней записи и идём назад по дням
    for (const [index, stat] of userStats.entries()) {
      const recordDate = new Date(stat.date);
      const expectedDate = new Date(lastRecord.date);
      expectedDate.setDate(expectedDate.getDate() - index);

      // Если дата записи соответствует ожидаемой дате в стрике
      if (recordDate.getTime() === expectedDate.getTime()) {
        streakDays++;
      } else {
        // Если есть пропуск - стрик прерывается
        break;
      }
    }

    // Вычисляем статистику за период стрика
    const streakStartDate = new Date(lastRecord.date);
    streakStartDate.setDate(streakStartDate.getDate() - streakDays + 1);

    const streakStats = await db.userStatistics.aggregate({
      where: {
        userId,
        date: {
          gte: streakStartDate,
          lte: lastRecord.date,
        },
      },
      _sum: {
        wordsAdded: true,
        wordsLearned: true,
        wordsRepeated: true,
      },
    });

    return {
      wordsAdded: streakStats._sum.wordsAdded || 0,
      wordsLearned: streakStats._sum.wordsLearned || 0,
      wordsInReview: streakStats._sum.wordsRepeated || 0,
      streakDays,
      hasActiveStreak: true,
    };
  }),
});
