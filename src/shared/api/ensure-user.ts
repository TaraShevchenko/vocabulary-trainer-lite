import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { handleUserCreated } from "./user-sync";

/**
 * Ensures that a user exists in the database.
 * This is a fallback mechanism in case the webhook fails.
 */
export async function ensureUserExists(userId: string) {
  // First, try to find the user in our database
  let user = await db.user.findUnique({
    where: { id: userId },
  });

  if (user) {
    return user;
  }

  // If user doesn't exist, get user data from Clerk and create them
  try {
    const clerkUser = await currentUser();

    if (!clerkUser || clerkUser.id !== userId) {
      throw new Error("User not found in Clerk");
    }

    // Use Clerk API data format directly
    user = await handleUserCreated(clerkUser);
    console.log("User created via fallback mechanism:", user.id);

    return user;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    throw error;
  }
}
