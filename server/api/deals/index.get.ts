import { userActions } from "~~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  if (!user || !user.id) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const query = getQuery(event);
  const limit = Number(query.limit) || 25;
  const offset = Number(query.offset) || 0;

  try {
    const apiKeys = await userActions.findApiKeysByUserId(user.id);

    if (!apiKeys || !apiKeys.activeCampaignAccountURL || !apiKeys.activeCampaignAccountKey) {
      throw createError({
        statusCode: 400,
        message: "ActiveCampaign API keys not found",
      });
    }

    const response = await $fetch(`${apiKeys.activeCampaignAccountURL}/api/3/deals`, {
      method: 'GET',
      headers: {
        'Api-Token': apiKeys.activeCampaignAccountKey,
      },
      params: {
        limit,
        offset,
      },
    });

    const activeCampaignAccountURL = apiKeys.activeCampaignAccountURL;
    const baseUrlActiveCampaign = activeCampaignAccountURL.replace(/^https?:\/\//, '').split('.')[0];

    return {
      deals: response.deals,
      meta: response.meta,
      baseUrlActiveCampaign,
    };
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch deals",
    });
  }
});
