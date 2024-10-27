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

    if (!apiKeys || !apiKeys.activeCampaignAccountURL || !apiKeys.activeCampaignAccountKey) {
      throw createError({
        statusCode: 400,
        message: "ActiveCampaign API keys not found",
      });
    }

    const pipelinesResponse = await $fetch(`${apiKeys.activeCampaignAccountURL}/api/3/dealGroups`, {
      method: 'GET',
      headers: {
        'Api-Token': apiKeys.activeCampaignAccountKey,
      },
    });

    if (!pipelinesResponse || !Array.isArray(pipelinesResponse.dealGroups)) {
      throw new Error("Invalid response from ActiveCampaign API");
    }

    // Fetch deal counts for each pipeline
    const dealCountsPromises = pipelinesResponse.dealGroups.map(async (pipeline) => {
      const dealsResponse = await $fetch(`${apiKeys.activeCampaignAccountURL}/api/3/deals?filters[group]=${pipeline.id}&limit=1`, {
        method: 'GET',
        headers: {
          'Api-Token': apiKeys.activeCampaignAccountKey,
        },
      });
      return { pipelineId: pipeline.id, count: dealsResponse.meta.total };
    });

    const dealCounts = await Promise.all(dealCountsPromises);

    // Add deal counts to pipeline data
    const pipelinesWithCounts = pipelinesResponse.dealGroups.map(pipeline => ({
      ...pipeline,
      dealCount: dealCounts.find(count => count.pipelineId === pipeline.id)?.count || 0
    }));

    // Extract the base URL from the activeCampaignAccountURL
    const baseUrlActiveCampaign = apiKeys.activeCampaignAccountURL.replace(/^https?:\/\//, '').split('.')[0];

    return {
      dealGroups: pipelinesWithCounts,
      baseUrlActiveCampaign,
    };
  } catch (error) {
    console.error("Failed to fetch pipelines:", error);
    throw createError({
      statusCode: 500,
      message: `Failed to fetch pipelines: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
