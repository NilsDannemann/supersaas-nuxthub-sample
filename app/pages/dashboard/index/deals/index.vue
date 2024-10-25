<template>
  <AppPageContainer title="Deals" description="Manage your deal pipelines and deals">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <template v-else>
      <!-- Pipelines Table -->
      <h2 class="text-xl font-semibold mb-4">Pipelines</h2>
      <div v-if="pipelines.length === 0">No pipelines found.</div>
      <div v-else class="border border-gray-200 dark:border-white/10 rounded-lg mb-8">
        <UTable :rows="pipelines" :columns="pipelineColumns">
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
      </div>

      <!-- Deals Table -->
      <h2 class="text-xl font-semibold mb-4">Deals</h2>
      <div v-if="deals.length === 0">No deals found.</div>
      <div v-else class="border border-gray-200 dark:border-white/10 rounded-lg">
        <UTable :rows="deals" :columns="dealColumns">
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
      </div>

      <!-- Pagination -->
      <div class="mt-4 flex justify-between items-center">
        <UButton
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          Previous
        </UButton>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <UButton
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          Next
        </UButton>
      </div>
    </template>
  </AppPageContainer>
</template>

<script setup>
const { data: pipelinesData, pending: pipelinesPending, error: pipelinesError } = await useFetch('/api/deals/pipelines', { lazy: true });
const loading = ref(pipelinesPending);
const pipelines = computed(() => pipelinesData.value?.dealGroups || []);

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

const currentPage = ref(1);
const itemsPerPage = 20;
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const { data: dealsData, pending: dealsPending, error: dealsError, refresh: refreshDeals } = await useFetch(() => `/api/deals?limit=${itemsPerPage}&offset=${(currentPage.value - 1) * itemsPerPage}`, { lazy: true });

const deals = computed(() => dealsData.value?.deals || []);
const error = computed(() => pipelinesError.value || dealsError.value);

watch(dealsData, (newData) => {
  if (newData && newData.meta) {
    totalItems.value = newData.meta.total;
  }
});

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

const changePage = async (newPage) => {
  currentPage.value = newPage;
  await refreshDeals();
};

onMounted(async () => {
  try {
    await pipelinesData.execute();
    await refreshDeals();
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
});
</script>
