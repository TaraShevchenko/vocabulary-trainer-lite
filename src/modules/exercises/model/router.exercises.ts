import { z } from "zod";
import { db } from "@/shared/api/db";
import { createTRPCRouter, protectedProcedure } from "@/shared/api/trpc";

export const exercisesRouter = createTRPCRouter({
  /**
   * Получить слова для упражнений из конкретной группы
   */
  getWordsForExercise: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Получаем слова из группы с их прогрессом для текущего пользователя
      const words = await db.word.findMany({
        where: {
          groupId: input.groupId,
        },
        include: {
          progress: {
            where: {
              userId: ctx.session.user.id,
            },
          },
        },
        take: input.limit,
        orderBy: [
          // Затем по дате создания
          {
            createdAt: "asc",
          },
        ],
      });

      // Сортируем по прогрессу (слова с меньшим прогрессом сначала)
      const wordsWithProgress = words.map((word) => {
        const userProgress = word.progress[0];
        return {
          id: word.id,
          english: word.english,
          russian: word.russian,
          description: word.description,
          progress: userProgress?.score || 0,
          lastStudied: userProgress?.updatedAt || word.createdAt,
          // Добавляем случайное число для перемешивания среди одинаковых прогрессов
          randomOrder: Math.random(),
        };
      });

      // Сортируем по прогрессу, а затем случайно среди одинаковых прогрессов
      wordsWithProgress.sort((a, b) => {
        if (a.progress !== b.progress) {
          return a.progress - b.progress;
        }
        // При одинаковом прогрессе сортируем случайно
        return a.randomOrder - b.randomOrder;
      });

      // Убираем randomOrder из результата
      return wordsWithProgress.map(({ randomOrder, ...word }) => word);
    }),

  /**
   * Обновить прогресс изучения слова
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        wordId: z.string(),
        isCorrect: z.boolean(),
        progressIncrement: z.number().min(0).max(100).default(10),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Проверяем, что слово существует
      const word = await db.word.findUnique({
        where: {
          id: input.wordId,
        },
      });

      if (!word) {
        throw new Error("Слово не найдено");
      }

      // Получаем текущий прогресс пользователя для этого слова
      const existingProgress = await db.progress.findUnique({
        where: {
          userId_wordId: {
            userId: ctx.session.user.id,
            wordId: input.wordId,
          },
        },
      });

      const currentScore = existingProgress?.score || 0;

      // Вычисляем новый прогресс
      let newScore: number;
      if (input.isCorrect) {
        newScore = Math.min(100, currentScore + input.progressIncrement);
      } else {
        // При неправильном ответе уменьшаем прогресс
        newScore = Math.max(
          0,
          currentScore - Math.floor(input.progressIncrement / 2),
        );
      }

      // Обновляем или создаем запись прогресса
      const updatedProgress = await db.progress.upsert({
        where: {
          userId_wordId: {
            userId: ctx.session.user.id,
            wordId: input.wordId,
          },
        },
        update: {
          score: newScore,
          updatedAt: new Date(),
        },
        create: {
          userId: ctx.session.user.id,
          wordId: input.wordId,
          score: newScore,
        },
      });

      // Обновляем статистику
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Ищем существующую запись статистики за сегодня
      const existingStats = await db.userStatistics.findFirst({
        where: {
          userId: ctx.session.user.id,
          date: today,
        },
      });

      const statsUpdate: { wordsAdded?: number; wordsLearned?: number } = {};

      // Если пользователь начал изучать слово впервые (прогресс был 0, стал > 0)
      if (currentScore === 0 && newScore > 0) {
        statsUpdate.wordsAdded = (existingStats?.wordsAdded || 0) + 1;
      }

      // Если слово было выучено (достигло 100%)
      if (newScore >= 100 && currentScore < 100) {
        statsUpdate.wordsLearned = (existingStats?.wordsLearned || 0) + 1;
      }

      // Обновляем статистику только если есть изменения
      if (Object.keys(statsUpdate).length > 0) {
        if (existingStats) {
          // Обновляем существующую запись
          await db.userStatistics.update({
            where: { id: existingStats.id },
            data: statsUpdate,
          });
        } else {
          // Создаем новую запись
          await db.userStatistics.create({
            data: {
              userId: ctx.session.user.id,
              date: today,
              wordsAdded: statsUpdate.wordsAdded || 0,
              wordsLearned: statsUpdate.wordsLearned || 0,
              wordsRepeated: 0,
            },
          });
        }
      }

      return {
        wordId: input.wordId,
        previousProgress: currentScore,
        newProgress: updatedProgress.score,
        isCorrect: input.isCorrect,
      };
    }),

  /**
   * Получить статистику упражнений для группы
   */
  getGroupStats: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Получаем все слова группы с прогрессом пользователя
      const words = await db.word.findMany({
        where: {
          groupId: input.groupId,
        },
        include: {
          progress: {
            where: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      const totalWords = words.length;

      // Подсчитываем статистику на основе прогресса пользователя
      const wordsWithUserProgress = words.map((word) => {
        const userProgress = word.progress[0];
        return {
          ...word,
          userScore: userProgress?.score || 0,
        };
      });

      const studiedWords = wordsWithUserProgress.filter(
        (word) => word.userScore > 0,
      ).length;

      const completedWords = wordsWithUserProgress.filter(
        (word) => word.userScore >= 100,
      ).length;

      const totalProgress = wordsWithUserProgress.reduce(
        (sum, word) => sum + word.userScore,
        0,
      );

      const averageProgress =
        totalWords > 0 ? Math.round(totalProgress / totalWords) : 0;

      return {
        totalWords,
        studiedWords,
        completedWords,
        averageProgress,
        unstudiedWords: totalWords - studiedWords,
      };
    }),
});
