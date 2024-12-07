<template>
  <AppPageContainer title="Deals">
    <template #description>
      <div class="flex items-center gap-4">
        <span>{{ totalItems }} Deals</span>
        <template v-if="dealsLoading">
          <USkeleton class="h-5 w-24" />
        </template>
        <template v-else>
          <span v-for="(value, currency) in totalDealValues" :key="currency">
            {{ formatCurrency(value, currency) }}
          </span>
        </template>
        <span class="text-gray-300 dark:text-gray-600">|</span>
        <UTooltip 
          :ui="{ 
            base: 'p-2 text-xs whitespace-normal h-auto'
          }"
        >
          <template #text>
            <div class="space-y-2">
              <div>
                <div class="font-medium text-gray-900 dark:text-white mb-1">Regular Fields</div>
                <div class="text-gray-500 dark:text-gray-400">{{ regularFieldsList }}</div>
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white mb-1">Custom Fields</div>
                <div class="text-gray-500 dark:text-gray-400">{{ customFieldsList }}</div>
              </div>
            </div>
          </template>
          <span class="text-sm underline cursor-pointer text-gray-500 dark:text-gray-400">
            {{ regularFields.length + customFields.length }} Deal Fields
          </span>
        </UTooltip>
      </div>
    </template>
    <DealsFilter @filter="handleFilter" />
    <DealsChart 
      :deals="allDeals"
      :loading="dealsLoading || pipelinesLoading"
      :totalItems="totalItems"
      :pipelinesData="pipelinesData || { dealGroups: [] }"
    />
    <DealsTable 
      :deals="deals"
      :loading="dealsLoading"
      :totalItems="totalItems"
      :baseUrlActiveCampaign="baseUrlActiveCampaign"
      @update:page="handlePageChange"
    />
  </AppPageContainer>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import DealsFilter from '~/components/Deals/Filter.vue';
import DealsTable from '~/components/Deals/Table.vue';
import DealsChart from '~/components/Deals/DataViews/Chart.vue';

const { data: pipelinesData, pending: pipelinesLoading } = await useFetch('/api/deals/pipelines', {
  lazy: true,
  server: false,
  default: () => ({ dealGroups: [] })
});

const deals = ref([]);
const totalItems = ref(0);
const dealsLoading = ref(true);
const baseUrlActiveCampaign = ref('');
const searchQuery = ref('');
const statusFilter = ref('');
const pipelineFilter = ref('');
const dateRangeFilter = ref(null);

const customFields = ref([]);
const regularFields = ref([]);

const totalDealValues = ref({});

const { data: customFieldsData, pending, error } = await useFetch('/api/deals/custom-fields', {
  lazy: true,
  server: false,
});

watch(customFieldsData, (newData) => {
  if (newData && newData.dealCustomFieldMeta) {
    customFields.value = newData.dealCustomFieldMeta;
  } else {
    customFields.value = [];
  }
}, { immediate: true });

// Fetch regular fields from the deals API
const { data: dealsFieldsData } = await useFetch('/api/deals?limit=1', {
  lazy: true,
  server: false,
});

watch(dealsFieldsData, (newData) => {
  if (newData && newData.deals && newData.deals.length > 0) {
    regularFields.value = Object.keys(newData.deals[0]).filter(key => 
      !['id', 'owner', 'contact', 'organization'].includes(key)
    );
  } else {
    regularFields.value = [];
  }
}, { immediate: true });

// Computed properties for tooltip content
const regularFieldsList = computed(() => regularFields.value.join(', '));
const customFieldsList = computed(() => customFields.value.map(field => field.fieldLabel).join(', '));

const dealPage = ref(1);
const itemsPerPage = 25;

const { data: dealsData, refresh: refreshDeals } = await useFetch(() => `/api/deals`, { 
  lazy: true,
  immediate: false,
  query: computed(() => ({
    limit: itemsPerPage,
    offset: (dealPage.value - 1) * itemsPerPage,
    search: searchQuery.value,
    status: statusFilter.value,
    pipeline: pipelineFilter.value,
    dateRange: dateRangeFilter.value ? JSON.stringify(dateRangeFilter.value) : null
  }))
});

const updateDealsPage = (newPage) => {
  dealPage.value = newPage;
};

const handleFilter = ({ search, status, pipeline, dateRange }) => {
  searchQuery.value = search;
  statusFilter.value = status;
  pipelineFilter.value = pipeline;
  dateRangeFilter.value = dateRange;
  dealPage.value = 1; // Reset to first page when filters change
  loadDeals();
};

// Add a new ref for all deals (for chart)
const allDeals = ref([]);

// Add a new fetch for all deals
const { data: allDealsData, refresh: refreshAllDeals } = await useFetch(() => `/api/deals`, { 
  lazy: true,
  immediate: false,
  query: computed(() => ({
    // Remove pagination, but keep filters
    search: searchQuery.value,
    status: statusFilter.value,
    pipeline: pipelineFilter.value,
    dateRange: dateRangeFilter.value ? JSON.stringify(dateRangeFilter.value) : null,
    // Add a parameter to get all deals
    all: true
  }))
});

// Update loadDeals to fetch both paginated and all deals
const loadDeals = async () => {
  dealsLoading.value = true;
  try {
    // Fetch paginated deals for table
    await refreshDeals();
    deals.value = dealsData.value?.deals || [];
    totalItems.value = dealsData.value?.meta?.total || 0;
    baseUrlActiveCampaign.value = dealsData.value?.baseUrlActiveCampaign || '';

    // Fetch all deals for chart
    await refreshAllDeals();
    allDeals.value = allDealsData.value?.deals || [];

    // Update currency totals
    if (dealsData.value?.meta?.currencies) {
      totalDealValues.value = Object.entries(dealsData.value.meta.currencies).reduce((acc, [currency, data]) => {
        acc[currency] = data.value;
        return acc;
      }, {});
    } else {
      totalDealValues.value = {};
    }
  } catch (err) {
    console.error("Failed to fetch deals:", err);
  } finally {
    dealsLoading.value = false;
  }
};

watch(dealPage, loadDeals);

// Initial load
loadDeals();

const formatCurrency = (value, currency) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  return formatter.format(value / 100); // Assuming value is in cents
};

const handlePageChange = (newPage) => {
  dealPage.value = newPage;
  loadDeals(); // This will trigger a data refresh with the new page
};
</script>
