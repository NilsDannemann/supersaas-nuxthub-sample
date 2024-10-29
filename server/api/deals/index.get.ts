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
  const search = query.search as string || '';
  const status = query.status as string || '';
  const pipeline = query.pipeline as string || '';
  const dateRange = query.dateRange ? JSON.parse(query.dateRange as string) : null;
  const sort = query.sort as string || '-cdate';

  try {
    const apiKeys = await userActions.findApiKeysByUserId(user.id);

    if (!apiKeys || !apiKeys.activeCampaignAccountUrl || !apiKeys.activeCampaignAccountKey) {
      throw createError({
        statusCode: 400,
        message: "ActiveCampaign API keys not found",
      });
    }

    let url = `${apiKeys.activeCampaignAccountUrl}/api/3/deals?limit=${limit}&offset=${offset}`;
    
    // Add filters to the API call
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (status) {
      url += `&filters[status]=${encodeURIComponent(status)}`;
    }
    if (pipeline) {
      url += `&filters[group]=${encodeURIComponent(pipeline)}`;
    }
    
    // Add date range filter
    if (dateRange) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      url += `&filters[created_after]=${encodeURIComponent(startDate)}`;
      url += `&filters[created_before]=${encodeURIComponent(endDate)}`;
    }

    if (sort) {
      url += `&orders[${sort.replace('-', '')}]=${sort.startsWith('-') ? 'DESC' : 'ASC'}`;
    }

    const response = await $fetch(url, {
      method: 'GET',
      headers: {
        'Api-Token': apiKeys.activeCampaignAccountKey,
      },
    });

    const activeCampaignAccountUrl = apiKeys.activeCampaignAccountUrl;
    const baseUrlActiveCampaign = activeCampaignAccountUrl.replace(/^https?:\/\//, '').split('.')[0];

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
