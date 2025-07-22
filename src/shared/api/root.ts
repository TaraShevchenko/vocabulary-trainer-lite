import { exercisesRouter } from "@/modules/exercises/model/router.exercises";
import { groupsRouter } from "@/modules/groups/model/router.groups";
import { statisticsRouter } from "@/modules/statistics/model/router.statistics";
import { createCallerFactory, createTRPCRouter } from "@/shared/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  groups: groupsRouter,
  exercises: exercisesRouter,
  statistics: statisticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
