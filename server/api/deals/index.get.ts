import { userActions } from "~~/server/services/db/UserActions";

// Add helper function to fetch all pages
async function fetchAllDeals(baseUrl: string, apiToken: string, queryParams: string[]) {
  let allDeals = [];
  let offset = 0;
  const limit = 100; // Maximum allowed by ActiveCampaign
  let hasMore = true;

  while (hasMore) {
    // Create URL for current page
    const pageParams = [...queryParams];
    pageParams.push(`limit=${limit}`);
    pageParams.push(`offset=${offset}`);
    const url = `${baseUrl}?${pageParams.join('&')}`;

    // Fetch page
    const response = await $fetch(url, {
      method: 'GET',
      headers: {
        'Api-Token': apiToken,
      },
    });

    // Add deals from this page
    allDeals = allDeals.concat(response.deals || []);

    // Check if there are more pages
    const total = response.meta?.total || 0;
    offset += limit;
    hasMore = offset < total;
  }

  return allDeals;
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  if (!user || !user.id) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const query = getQuery(event);
  const all = query.all === 'true';

  const limit = all ? undefined : (Number(query.limit) || 25);
  const offset = all ? undefined : (Number(query.offset) || 0);
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

    const baseUrl = `${apiKeys.activeCampaignAccountUrl}/api/3/deals`;
    const queryParams = [];
    
    // Add all query params except pagination
    if (search) {
      queryParams.push(`search=${encodeURIComponent(search)}`);
    }
    if (status) {
      queryParams.push(`filters[status]=${encodeURIComponent(status)}`);
    }
    if (pipeline) {
      queryParams.push(`filters[group]=${encodeURIComponent(pipeline)}`);
    }
    if (dateRange) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      queryParams.push(`filters[created_after]=${encodeURIComponent(startDate)}`);
      queryParams.push(`filters[created_before]=${encodeURIComponent(endDate)}`);
    }
    if (sort) {
      queryParams.push(`orders[${sort.replace('-', '')}]=${sort.startsWith('-') ? 'DESC' : 'ASC'}`);
    }

    let deals;
    let meta;

    if (all) {
      // Fetch all pages
      deals = await fetchAllDeals(baseUrl, apiKeys.activeCampaignAccountKey, queryParams);
      meta = { total: deals.length };
    } else {
      // Fetch single page with pagination
      const paginatedParams = [...queryParams];
      if (limit) paginatedParams.push(`limit=${limit}`);
      if (offset) paginatedParams.push(`offset=${offset}`);
      
      const url = `${baseUrl}${paginatedParams.length ? '?' + paginatedParams.join('&') : ''}`;
      const response = await $fetch(url, {
        method: 'GET',
        headers: {
          'Api-Token': apiKeys.activeCampaignAccountKey,
        },
      });
      
      deals = response.deals;
      meta = response.meta;
    }

    const activeCampaignAccountUrl = apiKeys.activeCampaignAccountUrl;
    const baseUrlActiveCampaign = activeCampaignAccountUrl.replace(/^https?:\/\//, '').split('.')[0];

    return {
      deals,
      meta,
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
