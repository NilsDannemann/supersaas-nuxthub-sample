<template>
  <AppPageContainer 
    title="Pipelines" 
    :description="`${totalItems} Pipelines`"
  >
    <PipelinesFilter />
    <PipelinesTable 
      :pipelines="pipelines"
      :loading="pipelinesLoading"
      :baseUrlActiveCampaign="baseUrlActiveCampaign"
      :totalItems="totalItems"
    />
  </AppPageContainer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import PipelinesFilter from '~/components/Pipelines/Filter.vue';
import PipelinesTable from '~/components/Pipelines/Table.vue';

const pipelines = ref([]);
const pipelinesLoading = ref(true);
const baseUrlActiveCampaign = ref('');
const totalItems = ref(0);

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
    totalItems.value = pipelines.value.length;
  } catch (err) {
    console.error("Failed to fetch pipelines:", err);
  } finally {
    pipelinesLoading.value = false;
  }
};

// Initial load
loadPipelines();
</script>
