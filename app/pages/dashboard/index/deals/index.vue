<template>
  <AppPageContainer title="Deals" description="Manage your deal pipelines">
    <div v-if="loading">Loading pipelines...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="pipelines.length === 0">No pipelines found.</div>
    <div v-else class="border border-gray-200 dark:border-white/10 rounded-lg">
      <UTable :rows="pipelines" :columns="columns">
        <template #title-data="{ row }">
          {{ row.title }}
        </template>
        <template #currency-data="{ row }">
          {{ row.currency }}
        </template>
        <template #stages-data="{ row }">
          {{ row.stages.length }}
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
    <div v-if="!loading && !error && pipelines.length === 0" class="mt-4">
      <p class="text-gray-500">
        No ActiveCampaign API keys found. Please add your API keys in the
        <UButton
          to="/dashboard/settings"
          variant="link"
          color="primary"
        >
          settings
        </UButton>.
      </p>
    </div>
  </AppPageContainer>
</template>

<script setup>
const { data: pipelinesData, pending, error } = await useFetch('/api/deals/pipelines', {
  lazy: true,
});

const loading = ref(pending);
const pipelines = computed(() => pipelinesData.value?.dealGroups || []);

const columns = [
  { key: 'title', label: 'Pipeline' },
  { key: 'currency', label: 'Currency' },
  { key: 'stages', label: 'Stages' },
  { key: 'actions', label: 'Actions' },
];

const getPipelineUrl = (pipelineId) => {
  const baseUrl = pipelinesData.value?.baseUrl || '';
  return `https://${baseUrl}.activehosted.com/app/deals?pipeline=${pipelineId}`;
};

onMounted(async () => {
  try {
    await pipelinesData.execute();
  } catch (err) {
    console.error("Failed to fetch pipelines:", err);
  }
});
</script>
