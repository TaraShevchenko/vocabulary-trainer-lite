import { createTRPCRouter, createCallerFactory } from "./trpc";
import { userRouter } from "@/modules/user/model/router.user";
import { ingredientRouter } from "@/modules/ingredient/model/router.ingredient";

export const appRouter = createTRPCRouter({
  user: userRouter,
  ingredient: ingredientRouter,
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
