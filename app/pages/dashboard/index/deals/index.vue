<template>
  <AppPageContainer title="Deals" description="Manage your deal pipelines">
    <div v-if="loading">Loading pipelines...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="pipelines.length === 0">No pipelines found.</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="pipeline in pipelines" :key="pipeline.id" class="p-4">
        <template #header>
          <h3 class="text-lg font-semibold">{{ pipeline.title }}</h3>
        </template>
        <p class="text-sm text-gray-500">Currency: {{ pipeline.currency }}</p>
        <p class="text-sm text-gray-500">Stages: {{ pipeline.stages.length }}</p>
        <template #footer>
          <UButton
            color="primary"
            variant="soft"
            size="sm"
            :to="`/dashboard/deals/${pipeline.id}`"
          >
            View Details
          </UButton>
        </template>
      </UCard>
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

onMounted(async () => {
  try {
    await pipelinesData.execute();
  } catch (err) {
    console.error("Failed to fetch pipelines:", err);
  }
});
</script>
