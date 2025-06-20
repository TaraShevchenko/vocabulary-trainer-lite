import { redirect } from "next/navigation";
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { ensureUserExists } from "./ensure-user";

/**
 * Wrapper around Clerk's auth() function for compatibility with existing code
 */
export const auth = async () => {
  const { userId } = await clerkAuth();
  const user = await currentUser();

  if (!userId || !user) {
    return null;
  }

  return {
    user: {
      id: userId,
      name: user.fullName || user.firstName || null,
      email: user.emailAddresses[0]?.emailAddress || null,
      image: user.imageUrl || null,
    },
  };
};

/**
 * Sign out function for compatibility
 */
export const signOut = async (options?: { redirectTo?: string }) => {
  // Clerk handles sign out through their components
  // This is just for compatibility with existing code
  if (options?.redirectTo) {
    redirect(options.redirectTo);
  }
};

/**
 * Get current user ID from Clerk
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const { userId } = await clerkAuth();
  return userId;
};

/**
 * Require authentication - throws if not authenticated
 */
export const requireAuth = async () => {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  return session;
};

/**
 * Get current user from database, ensuring they exist
 */
export const getCurrentUserFromDB = async () => {
  const { userId } = await clerkAuth();

  if (!userId) {
    return null;
  }

  try {
    const user = await ensureUserExists(userId);
    return user;
  } catch (error) {
    console.error("Error getting user from database:", error);
    return null;
  }
};

/**
 * Require authentication and return user from database
 */
export const requireAuthWithDB = async () => {
  const { userId } = await clerkAuth();

  if (!userId) {
    redirect("/login");
  }

  try {
    const user = await ensureUserExists(userId);
    return user;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    redirect("/login");
  }
};
