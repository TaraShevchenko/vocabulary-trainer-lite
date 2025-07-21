import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "@/shared/api/db";
import { createTRPCRouter, protectedProcedure } from "@/shared/api/trpc";

const SortOption = z.enum(["favorites", "newest", "alphabetical"]);

export const groupsRouter = createTRPCRouter({
  getPaginated: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.number().optional(),
        search: z.string().optional(),
        sortBy: SortOption.default("favorites"),
        hideLearned: z.boolean().default(true),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, cursor, search, sortBy, hideLearned } = input;
      const userId = ctx.session.user.id;

      const whereClause: Prisma.WordGroupWhereInput = {};

      if (search) {
        whereClause.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      if (hideLearned) {
        whereClause.words = {
          some: {
            OR: [
              {
                progress: {
                  none: {
                    userId,
                  },
                },
              },
              {
                progress: {
                  some: {
                    userId,
                    score: {
                      lt: 100,
                    },
                  },
                },
              },
            ],
          },
        };
      }

      let orderBy: Array<{
        favoritedByUsers?: { _count: "desc" };
        name?: "asc";
        createdAt?: "desc";
      }> = [];
      switch (sortBy) {
        case "favorites":
          orderBy = [
            {
              favoritedByUsers: {
                _count: "desc",
              },
            },
            {
              name: "asc",
            },
          ];
          break;
        case "newest":
          orderBy = [
            {
              createdAt: "desc",
            },
          ];
          break;
      }

      const groups = await db.wordGroup.findMany({
        where: whereClause,
        include: {
          words: {
            include: {
              progress: {
                where: {
                  userId,
                },
              },
            },
          },
          favoritedByUsers: {
            where: {
              id: userId,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy,
        take: limit + 1,
        skip: cursor ? cursor : 0,
      });

      const groupsWithStats = groups.map((group) => {
        const totalWords = group.words.length;

        const wordsWithUserProgress = group.words.map((word) => {
          const userProgress = word.progress[0];
          return {
            ...word,
            userScore: userProgress?.score || 0,
          };
        });

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
          isFavorite: group.favoritedByUsers.length > 0,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
        };
      });

      let nextCursor: number | undefined = undefined;
      if (groups.length > limit) {
        groupsWithStats.pop();
        nextCursor = (cursor || 0) + limit;
      }

      let totalCount: number | undefined = undefined;
      if (!cursor) {
        totalCount = await db.wordGroup.count({
          where: whereClause,
        });
      }

      return {
        groups: groupsWithStats,
        nextCursor,
        totalCount,
      };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
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
        favoritedByUsers: {
          where: {
            id: ctx.session.user.id,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        {
          favoritedByUsers: {
            _count: "desc",
          },
        },
        {
          name: "asc",
        },
      ],
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
        isFavorite: group.favoritedByUsers.length > 0,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
    });

    return groupsWithStats;
  }),

  toggleFavorite: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const { groupId } = input;

      // Проверяем существует ли группа
      const group = await db.wordGroup.findUnique({
        where: { id: groupId },
        include: {
          favoritedByUsers: {
            where: {
              id: userId,
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

      const isFavorite = group.favoritedByUsers.length > 0;

      if (isFavorite) {
        // Удаляем из избранного
        await db.wordGroup.update({
          where: { id: groupId },
          data: {
            favoritedByUsers: {
              disconnect: {
                id: userId,
              },
            },
          },
        });
      } else {
        // Добавляем в избранное
        await db.wordGroup.update({
          where: { id: groupId },
          data: {
            favoritedByUsers: {
              connect: {
                id: userId,
              },
            },
          },
        });
      }

      return {
        success: true,
        isFavorite: !isFavorite,
      };
    }),

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
