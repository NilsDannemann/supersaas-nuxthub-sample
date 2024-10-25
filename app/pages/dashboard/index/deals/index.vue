<template>
  <AppPageContainer title="Deals" description="Manage your deal pipelines and deals">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="text-red-500">
      <p>Error: {{ error }}</p>
      <p v-if="errorDetails" class="mt-2 text-sm">Details: {{ errorDetails }}</p>
    </div>
    <template v-else>
      <!-- Pipelines Table -->
      <h2 class="text-xl font-semibold mb-4">Pipelines</h2>
      <div v-if="pipelines.length === 0">No pipelines found.</div>
      <div v-else class="border border-gray-200 dark:border-white/10 rounded-lg mb-8">
        <UTable 
          :rows="paginatedPipelines" 
          :columns="pipelineColumns"
          :loading="pipelinesLoading"
        >
          <template #title-data="{ row }">
            {{ row.title }}
          </template>
          <template #stages-data="{ row }">
            {{ row.stages.length }}
          </template>
          <template #dealCount-data="{ row }">
            {{ row.dealCount }}
          </template>
          <template #actions-data="{ row }">
            <UButton
              color="gray"
              variant="ghost"
              size="xs"
              :to="getPipelineUrl(row.id)"
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </UButton>
          </template>
        </UTable>
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Showing {{ pipelinePageFrom }} to {{ pipelinePageTo }} of {{ pipelines.length }} results
          </div>
          <UPagination
            v-model="pipelinePage"
            :page-count="pipelineTotalPages"
            :total="pipelines.length"
          />
        </div>
      </div>

      <!-- Deals Table -->
      <h2 class="text-xl font-semibold mb-4">Deals</h2>
      <div v-if="deals.length === 0">No deals found.</div>
      <div v-else class="border border-gray-200 dark:border-white/10 rounded-lg">
        <UTable 
          :rows="paginatedDeals" 
          :columns="dealColumns"
          :loading="dealsLoading"
        >
          <template #title-data="{ row }">
            {{ row.title }}
          </template>
          <template #value-data="{ row }">
            {{ formatCurrency(row.value, row.currency) }}
          </template>
          <template #contact-data="{ row }">
            {{ row.contact }}
          </template>
          <template #status-data="{ row }">
            {{ row.status }}
          </template>
        </UTable>
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Showing {{ dealPageFrom }} to {{ dealPageTo }} of {{ totalItems }} results
          </div>
          <UPagination
            v-model="dealPage"
            :page-count="dealTotalPages"
            :total="totalItems"
            :ui="{
              wrapper: 'flex items-center gap-1',
              button: {
                icon: 'w-4 h-4',
                base: 'disabled:opacity-50 disabled:cursor-not-allowed',
                padding: 'p-1',
                size: 'sm'
              }
            }"
          />
        </div>
      </div>
    </template>
  </AppPageContainer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const loading = ref(true);
const error = ref(null);
const errorDetails = ref(null);
const pipelines = ref([]);
const deals = ref([]);
const pipelinePage = ref(1);
const dealPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);

const pipelinesLoading = ref(false);
const dealsLoading = ref(false);

const pipelineColumns = [
  { key: 'title', label: 'Pipeline' },
  { key: 'stages', label: 'Stages' },
  { key: 'dealCount', label: 'Deals' },
  { key: 'actions', label: 'Actions' },
];

const dealColumns = [
  { key: 'title', label: 'Deal' },
  { key: 'value', label: 'Value' },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status' },
];

const { data: pipelinesData, pending: pipelinesPending, error: pipelinesError, refresh: refreshPipelines } = await useFetch('/api/deals/pipelines', { lazy: true });
const { data: dealsData, pending: dealsPending, error: dealsError, refresh: refreshDeals } = await useFetch(() => `/api/deals?limit=${itemsPerPage}&offset=${(dealPage.value - 1) * itemsPerPage}`, { lazy: true });

watch([pipelinesData, dealsData], ([newPipelinesData, newDealsData]) => {
  if (newPipelinesData) {
    pipelines.value = newPipelinesData.dealGroups || [];
  }
  if (newDealsData) {
    deals.value = newDealsData.deals || [];
    totalItems.value = newDealsData.meta?.total || 0;
  }
}, { immediate: true });

const paginatedPipelines = computed(() => {
  const start = (pipelinePage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return pipelines.value.slice(start, end);
});

const paginatedDeals = computed(() => deals.value);

const pipelineTotalPages = computed(() => Math.ceil(pipelines.value.length / itemsPerPage));
const dealTotalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const pipelinePageFrom = computed(() => ((pipelinePage.value - 1) * itemsPerPage) + 1);
const pipelinePageTo = computed(() => Math.min(pipelinePage.value * itemsPerPage, pipelines.value.length));

const dealPageFrom = computed(() => ((dealPage.value - 1) * itemsPerPage) + 1);
const dealPageTo = computed(() => Math.min(dealPage.value * itemsPerPage, totalItems.value));

const getPipelineUrl = (pipelineId) => {
  const baseUrl = pipelinesData.value?.baseUrl || '';
  return `https://${baseUrl}.activehosted.com/app/deals?pipeline=${pipelineId}`;
};

const formatCurrency = (value, currency) => {
  // Assuming the value from the API is in cents
  const dollars = value / 100;
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency || 'USD', // Use the provided currency or default to USD
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
};

watch(dealPage, async () => {
  try {
    dealsLoading.value = true;
    await refreshDeals();
  } catch (err) {
    console.error("Failed to refresh deals:", err);
    error.value = "Failed to refresh deals";
    errorDetails.value = err.message;
  } finally {
    dealsLoading.value = false;
  }
});

onMounted(async () => {
  try {
    loading.value = true;
    pipelinesLoading.value = true;
    dealsLoading.value = true;
    await Promise.all([refreshPipelines(), refreshDeals()]);
  } catch (err) {
    console.error("Failed to fetch data:", err);
    error.value = "Failed to load data. Please try again later.";
    errorDetails.value = err.message;
  } finally {
    loading.value = false;
    pipelinesLoading.value = false;
    dealsLoading.value = false;
  }
});
</script>
