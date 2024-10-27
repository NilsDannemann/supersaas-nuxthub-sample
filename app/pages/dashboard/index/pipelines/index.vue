<template>
  <AppPageContainer title="Pipelines" description="View your pipelines">
    <PipelinesFilter />
    <PipelinesTable 
      :pipelines="pipelines"
      :loading="pipelinesLoading"
      :baseUrlActiveCampaign="baseUrlActiveCampaign"
    />
  </AppPageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PipelinesFilter from '~/components/Deals/PipelinesFilter.vue';
import PipelinesTable from '~/components/Deals/PipelinesTable.vue';

const pipelines = ref([]);
const pipelinesLoading = ref(true);
const baseUrlActiveCampaign = ref('');

const { data: pipelinesData, refresh: refreshPipelines } = await useFetch('/api/deals/pipelines', { 
  lazy: true,
  immediate: false
});

const loadPipelines = async () => {
  pipelinesLoading.value = true;
  try {
    await refreshPipelines();
    pipelines.value = pipelinesData.value?.dealGroups || [];
    baseUrlActiveCampaign.value = pipelinesData.value?.baseUrlActiveCampaign || '';
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
