import { userActions } from "~~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  try {
    const userApiKeys = await userActions.findApiKeysByUserId(user.id);

    // If no API keys are found, return an empty object
    return { apiKeys: userApiKeys || {} };
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    // Instead of throwing an error, return an empty object
    return { apiKeys: {} };
  }
});
