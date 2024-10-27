<template>
  <div class="border border-gray-200 dark:border-white/10 rounded-lg">
    <div v-if="loading" class="p-8 text-center">
      <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8 mx-auto text-gray-400 dark:text-gray-500" />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading pipelines...</p>
    </div>
    <template v-else>
      <UTable 
        v-if="pipelines.length > 0"
        :rows="pipelines" 
        :columns="columns"
        :loading="loading"
      >
        <template #title-data="{ row }">
          <a
            :href="getPipelineUrl(row.id)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 underline"
          >
            {{ row.title }}
          </a>
        </template>
        <template #stages-data="{ row }">
          {{ row.stages.length }}
        </template>
        <template #dealCount-data="{ row }">
          {{ row.dealCount }}
        </template>
      </UTable>
      <div v-else class="p-8 text-center text-gray-500 dark:text-gray-400">
        No pipelines found.
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  pipelines: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  baseUrlActiveCampaign: {
    type: String,
    required: true
  }
});

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'stages', label: 'Stages' },
  { key: 'dealCount', label: 'Deals' },
];

const getPipelineUrl = (pipelineId) => {
  return `https://${props.baseUrlActiveCampaign}.activehosted.com/app/deals?pipeline=${pipelineId}`;
};
</script>
