import { type UserJSON, type DeletedObjectJSON } from "@clerk/nextjs/server";
import { type User } from "@prisma/client";
import { db } from "./db";

interface ClerkEmailAddress {
  id: string;
  emailAddress: string;
}

interface ClerkApiUserData {
  id: string;
  emailAddresses: ClerkEmailAddress[];
  primaryEmailAddressId: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

type ClerkUserData = UserJSON | ClerkApiUserData;

function isWebhookData(userData: ClerkUserData): userData is UserJSON {
  return "email_addresses" in userData;
}

export async function handleUserCreated(
  userData: ClerkUserData,
): Promise<User> {
  const userInfo = extractUserInfo(userData);

  try {
    const user = await db.user.create({
      data: {
        id: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        name:
          [userInfo.firstName, userInfo.lastName].filter(Boolean).join(" ") ||
          null,
        username: userInfo.username,
        imageUrl: userInfo.imageUrl,
        clerkCreatedAt: userInfo.createdAt,
        clerkUpdatedAt: userInfo.updatedAt,
      },
    });
    console.log("User created in database:", userInfo.id);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function handleUserUpdated(
  userData: ClerkUserData,
): Promise<User> {
  const userInfo = extractUserInfo(userData);

  try {
    const user = await db.user.upsert({
      where: { id: userInfo.id },
      update: {
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        name:
          [userInfo.firstName, userInfo.lastName].filter(Boolean).join(" ") ||
          null,
        username: userInfo.username,
        imageUrl: userInfo.imageUrl,
        clerkUpdatedAt: userInfo.updatedAt,
      },
      create: {
        id: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        name:
          [userInfo.firstName, userInfo.lastName].filter(Boolean).join(" ") ||
          null,
        username: userInfo.username,
        imageUrl: userInfo.imageUrl,
        clerkCreatedAt: userInfo.createdAt,
        clerkUpdatedAt: userInfo.updatedAt,
      },
    });
    console.log("User upserted in database:", userInfo.id);
    return user;
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

function extractUserInfo(userData: ClerkUserData) {
  if (isWebhookData(userData)) {
    const primaryEmail = userData.email_addresses.find(
      (email) => email.id === userData.primary_email_address_id,
    );

    return {
      id: userData.id,
      email: primaryEmail?.email_address || "",
      firstName: userData.first_name,
      lastName: userData.last_name,
      username: userData.username,
      imageUrl: userData.image_url,
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(userData.updated_at),
    };
  } else {
    // API data format
    const primaryEmail = userData.emailAddresses.find(
      (email) => email.id === userData.primaryEmailAddressId,
    );

    return {
      id: userData.id,
      email: primaryEmail?.emailAddress || "",
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      imageUrl: userData.imageUrl,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
    };
  }
}

export async function handleUserDeleted(
  userData: DeletedObjectJSON,
): Promise<void> {
  try {
    await db.user.delete({
      where: {
        id: userData.id,
      },
    });
    console.log(`User ${userData.id} deleted successfully`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
