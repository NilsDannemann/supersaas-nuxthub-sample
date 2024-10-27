<template>
  <AppPageContainer title="Pipelines" description="Manage your deal pipelines">
    <DealsPipelinesTable 
      :pipelines="pipelines"
      :loading="pipelinesLoading"
      :baseUrl="baseUrl"
    />
  </AppPageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DealsPipelinesTable from '~/components/Deals/PipelinesTable.vue';

const pipelines = ref([]);
const baseUrl = ref('');
const pipelinesLoading = ref(true);

const { data: pipelinesData, refresh: refreshPipelines } = await useFetch('/api/deals/pipelines', { 
  lazy: true,
  immediate: false
});

const loadPipelines = async () => {
  pipelinesLoading.value = true;
  try {
    await refreshPipelines();
    pipelines.value = pipelinesData.value?.dealGroups || [];
    baseUrl.value = pipelinesData.value?.baseUrl || '';
  } catch (err) {
    console.error("Failed to fetch pipelines:", err);
  } finally {
    pipelinesLoading.value = false;
  }
};

onMounted(() => {
  loadPipelines();
});
</script>
