import { z } from "zod";
import { db } from "@/shared/api/db";
import { createTRPCRouter, protectedProcedure } from "@/shared/api/trpc";
import { TRPCError } from "@trpc/server";

export const groupsRouter = createTRPCRouter({
  /**
   * Получить все группы слов с информацией о прогрессе для текущего пользователя
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Получаем все группы с количеством слов и прогрессом пользователя
    const groups = await db.wordGroup.findMany({
      include: {
        words: {
          include: {
            progress: {
              where: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Вычисляем статистику для каждой группы на основе прогресса пользователя
    const groupsWithStats = groups.map((group) => {
      const totalWords = group.words.length;
      
      // Получаем прогресс пользователя для каждого слова
      const wordsWithUserProgress = group.words.map((word) => {
        const userProgress = word.progress[0];
        return {
          ...word,
          userScore: userProgress?.score || 0,
        };
      });

      const wordsWithProgress = wordsWithUserProgress.filter(
        (word) => word.userScore > 0,
      );

      const totalProgress = wordsWithUserProgress.reduce(
        (sum, word) => sum + word.userScore,
        0,
      );

      const averageProgress =
        totalWords > 0 ? Math.round(totalProgress / totalWords) : 0;

      const completedWords = wordsWithUserProgress.filter(
        (word) => word.userScore >= 100,
      ).length;

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        totalWords,
        completedWords,
        averageProgress,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
    });

    return groupsWithStats;
  }),

  /**
   * Получить информацию о конкретной группе
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const group = await db.wordGroup.findUnique({
        where: { id: input.id },
        include: {
          words: {
            include: {
              progress: {
                where: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Группа не найдена",
        });
      }

      // Вычисляем статистику группы на основе прогресса пользователя
      const totalWords = group.words.length;
      
      // Получаем прогресс пользователя для каждого слова
      const wordsWithUserProgress = group.words.map((word) => {
        const userProgress = word.progress[0];
        return {
          ...word,
          userScore: userProgress?.score || 0,
        };
      });

      const wordsWithProgress = wordsWithUserProgress.filter(
        (word) => word.userScore > 0,
      );

      const totalProgress = wordsWithUserProgress.reduce(
        (sum, word) => sum + word.userScore,
        0,
      );

      const averageProgress =
        totalWords > 0 ? Math.round(totalProgress / totalWords) : 0;

      const completedWords = wordsWithUserProgress.filter(
        (word) => word.userScore >= 100,
      ).length;

      return {
        ...group,
        stats: {
          totalWords,
          completedWords,
          averageProgress,
          studiedWords: wordsWithProgress.length,
          unstudiedWords: totalWords - wordsWithProgress.length,
        },
      };
    }),
});
