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
    const apiKeys = await userActions.findApiKeysByUserId(user.id);

    if (!apiKeys || !apiKeys.activeCampaignAccountURL || !apiKeys.activeCampaignAccountKey) {
      throw createError({
        statusCode: 400,
        message: "ActiveCampaign API keys not found",
      });
    }

    const response = await $fetch(`${apiKeys.activeCampaignAccountURL}/api/3/dealGroups`, {
      method: 'GET',
      headers: {
        'Api-Token': apiKeys.activeCampaignAccountKey,
      },
    });

    // Extract the base URL from the activeCampaignAccountURL
    const baseUrl = apiKeys.activeCampaignAccountURL.split('://')[1].split('.')[0];

    return {
      ...response,
      baseUrl,
    };
  } catch (error) {
    console.error("Failed to fetch pipelines:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch pipelines",
    });
  }
});
