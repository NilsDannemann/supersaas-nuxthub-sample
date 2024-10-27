<template>
  <AppPageContainer title="Deals" description="Manage your deal pipelines and deals">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="text-red-500">
      <p>Error: {{ error }}</p>
      <p v-if="errorDetails" class="mt-2 text-sm">Details: {{ errorDetails }}</p>
    </div>
    <template v-else>
      <DealsPipelinesTable 
        :pipelines="pipelines"
        :loading="pipelinesLoading"
        :baseUrl="baseUrl"
      />
      <DealsTable 
        :deals="deals"
        :loading="dealsLoading"
        :totalItems="totalItems"
        @update:page="updateDealsPage"
      />
    </template>
  </AppPageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DealsPipelinesTable from '~/components/Deals/PipelinesTable.vue';
import DealsTable from '~/components/Deals/DealsTable.vue';

const loading = ref(true);
const error = ref(null);
const errorDetails = ref(null);
const pipelines = ref([]);
const deals = ref([]);
const totalItems = ref(0);
const baseUrl = ref('');

const pipelinesLoading = ref(false);
const dealsLoading = ref(false);

const dealPage = ref(1);
const itemsPerPage = 25;

const { data: pipelinesData, pending: pipelinesPending, error: pipelinesError, refresh: refreshPipelines } = await useFetch('/api/deals/pipelines', { lazy: true });
const { data: dealsData, pending: dealsPending, error: dealsError, refresh: refreshDeals } = await useFetch(() => `/api/deals?limit=${itemsPerPage}&offset=${(dealPage.value - 1) * itemsPerPage}`, { 
  lazy: true,
  watch: [dealPage]
});

const updateDealsPage = (newPage) => {
  dealPage.value = newPage;
};

onMounted(async () => {
  try {
    loading.value = true;
    pipelinesLoading.value = true;
    dealsLoading.value = true;
    
    await Promise.all([refreshPipelines(), refreshDeals()]);
    
    pipelines.value = pipelinesData.value?.dealGroups || [];
    deals.value = dealsData.value?.deals || [];
    totalItems.value = dealsData.value?.meta?.total || 0;
    baseUrl.value = pipelinesData.value?.baseUrl || '';
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

watch(dealPage, async () => {
  try {
    dealsLoading.value = true;
    await refreshDeals();
    deals.value = dealsData.value?.deals || [];
    totalItems.value = dealsData.value?.meta?.total || 0;
  } catch (err) {
    console.error("Failed to refresh deals:", err);
    error.value = "Failed to refresh deals";
    errorDetails.value = err.message;
  } finally {
    dealsLoading.value = false;
  }
});
</script>
