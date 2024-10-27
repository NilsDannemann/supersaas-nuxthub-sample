<template>
  <AppPageContainer title="Deals" description="Manage your deal pipelines and deals">
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
  </AppPageContainer>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import DealsPipelinesTable from '~/components/Deals/PipelinesTable.vue';
import DealsTable from '~/components/Deals/DealsTable.vue';

const pipelines = ref([]);
const deals = ref([]);
const totalItems = ref(0);
const baseUrl = ref('');

const pipelinesLoading = ref(true);
const dealsLoading = ref(true);

const dealPage = ref(1);
const itemsPerPage = 25;

const { data: pipelinesData, refresh: refreshPipelines } = await useFetch('/api/deals/pipelines', { 
  lazy: true,
  immediate: false
});

const { data: dealsData, refresh: refreshDeals } = await useFetch(() => `/api/deals?limit=${itemsPerPage}&offset=${(dealPage.value - 1) * itemsPerPage}`, { 
  lazy: true,
  immediate: false,
  watch: [dealPage]
});

const updateDealsPage = (newPage) => {
  dealPage.value = newPage;
};

const loadPipelines = async () => {
  try {
    pipelinesLoading.value = true;
    await refreshPipelines();
    pipelines.value = pipelinesData.value?.dealGroups || [];
    baseUrl.value = pipelinesData.value?.baseUrl || '';
  } catch (err) {
    console.error("Failed to fetch pipelines:", err);
  } finally {
    pipelinesLoading.value = false;
  }
};

const loadDeals = async () => {
  try {
    dealsLoading.value = true;
    await refreshDeals();
    deals.value = dealsData.value?.deals || [];
    totalItems.value = dealsData.value?.meta?.total || 0;
  } catch (err) {
    console.error("Failed to fetch deals:", err);
  } finally {
    dealsLoading.value = false;
  }
};

onMounted(() => {
  loadPipelines();
  loadDeals();
});

watch(dealPage, loadDeals);
</script>
