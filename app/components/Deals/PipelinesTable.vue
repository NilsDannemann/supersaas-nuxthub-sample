<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Pipelines</h2>
    <div v-if="loading" class="p-4 text-center">
      <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8 mx-auto" />
      <p class="mt-2">Loading pipelines...</p>
    </div>
    <div v-else-if="pipelines.length === 0">No pipelines found.</div>
    <div v-else class="border border-gray-200 dark:border-white/10 rounded-lg mb-8">
      <UTable 
        :rows="paginatedPipelines" 
        :columns="columns"
        :loading="loading"
      >
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
          <NuxtLink
            :to="getPipelineUrl(row.id)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 underline"
          >
            View
          </NuxtLink>
        </template>
      </UTable>
      <div v-if="pipelines.length > itemsPerPage" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Showing {{ pageFrom }} to {{ pageTo }} of {{ pipelines.length }} results
        </div>
        <UPagination
          v-model="page"
          :page-count="totalPages"
          :total="pipelines.length"
          :ui="paginationUI"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  pipelines: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  baseUrl: {
    type: String,
    required: true
  }
});

const columns = [
  { key: 'title', label: 'Pipeline' },
  { key: 'stages', label: 'Stages' },
  { key: 'dealCount', label: 'Deals' },
  { key: 'actions', label: 'Actions' },
];

const itemsPerPage = 25;
const page = ref(1);

const paginatedPipelines = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return props.pipelines.slice(start, end);
});

const totalPages = computed(() => Math.ceil(props.pipelines.length / itemsPerPage));
const pageFrom = computed(() => ((page.value - 1) * itemsPerPage) + 1);
const pageTo = computed(() => Math.min(page.value * itemsPerPage, props.pipelines.length));

const getPipelineUrl = (pipelineId) => {
  return `https://${props.baseUrl}.activehosted.com/app/deals?pipeline=${pipelineId}`;
};

const paginationUI = {
  wrapper: 'flex items-center gap-1',
  base: 'min-w-[35px] h-8 flex items-center justify-center text-sm',
  rounded: 'rounded-sm',
  active: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
  inactive: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
};
</script>

