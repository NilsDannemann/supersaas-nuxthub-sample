import { userActions } from "~~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  if (!user || !user.id) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  try {
    const apiKeys = await userActions.findApiKeysByUserId(user.id);

    if (!apiKeys || !apiKeys.activeCampaignAccountUrl || !apiKeys.activeCampaignAccountKey) {
      throw createError({
        statusCode: 400,
        message: "ActiveCampaign API keys not found",
      });
    }

    const response = await $fetch(`${apiKeys.activeCampaignAccountUrl}/api/3/dealCustomFieldMeta`, {
      method: 'GET',
      headers: {
        'Api-Token': apiKeys.activeCampaignAccountKey,
      },
    });

    if (!response || !response.dealCustomFieldMeta) {
      throw createError({
        statusCode: 404,
        message: "No custom fields found",
      });
    }

    return {
      dealCustomFieldMeta: response.dealCustomFieldMeta
    };
  } catch (error) {
    console.error("Failed to fetch custom deal fields:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch custom deal fields",
    });
  }
});
