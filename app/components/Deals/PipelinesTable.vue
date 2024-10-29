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
            :href="getPipelineUrl(row.id).href"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-900 dark:text-white underline"
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
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ totalItems > 0 ? `Showing ${pageFrom} to ${pageTo} of ${totalItems} results` : 'No results' }}
      </div>
      <UPagination
        v-if="totalItems > itemsPerPage"
        v-model="currentPage"
        :total="totalItems"
        :page-count="itemsPerPage"
        :ui="paginationUI"
        @update:model-value="updatePage"
      />
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
  baseUrlActiveCampaign: {
    type: String,
    required: true
  },
  totalItems: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:page']);

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'stages', label: 'Stages' },
  { key: 'dealCount', label: 'Deals' },
];

const itemsPerPage = 25;
const currentPage = ref(1);

const pageFrom = computed(() => {
  if (props.totalItems === 0) return 0;
  return ((currentPage.value - 1) * itemsPerPage) + 1;
});

const pageTo = computed(() => {
  if (props.totalItems === 0) return 0;
  return Math.min(currentPage.value * itemsPerPage, props.totalItems);
});

const getPipelineUrl = (pipelineId) => {
  return {
    href: `https://${props.baseUrlActiveCampaign}.activehosted.com/app/deals?pipeline=${pipelineId}`,
    class: 'text-gray-900 dark:text-white underline'
  };
};

const getDealUrl = (dealId) => {
  return {
    href: `https://${props.baseUrlActiveCampaign}.activehosted.com/app/deals/${dealId}`,
    class: 'text-gray-900 dark:text-white underline'
  };
};

const paginationUI = {
  wrapper: 'flex items-center gap-1',
  base: 'min-w-[35px] h-8 flex items-center justify-center text-sm',
  rounded: 'rounded-sm',
  active: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
  inactive: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
};

const updatePage = (newPage) => {
  currentPage.value = newPage;
  emit('update:page', newPage);
};
</script>
