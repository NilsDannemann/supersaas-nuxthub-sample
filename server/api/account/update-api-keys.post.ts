import { userActions } from "~~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const body = await readBody(event);

  if (!body.activeCampaignAccountURL || !body.activeCampaignAccountKey) {
    throw createError({
      statusCode: 400,
      message: "Missing required fields",
    });
  }

  try {
    await userActions.updateApiKeys(user.id, {
      activeCampaignAccountURL: body.activeCampaignAccountURL,
      activeCampaignAccountKey: body.activeCampaignAccountKey,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update API keys:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to update API keys",
    });
  }
});
