<template>
  <AppPageContainer title="Deals" description="Manage your deals">
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
import DealsTable from '~/components/Deals/DealsTable.vue';

const deals = ref([]);
const totalItems = ref(0);
const dealsLoading = ref(true);

const dealPage = ref(1);
const itemsPerPage = 25;

const { data: dealsData, refresh: refreshDeals } = await useFetch(() => `/api/deals?limit=${itemsPerPage}&offset=${(dealPage.value - 1) * itemsPerPage}`, { 
  lazy: true,
  immediate: false,
  watch: [dealPage]
});

const updateDealsPage = (newPage) => {
  dealPage.value = newPage;
};

const loadDeals = async () => {
  dealsLoading.value = true;
  try {
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
  loadDeals();
});

watch(dealPage, loadDeals);
</script>
