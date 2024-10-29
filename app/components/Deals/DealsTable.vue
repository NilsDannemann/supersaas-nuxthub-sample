<template>
  <div class="border border-gray-200 dark:border-white/10 rounded-lg">
    <div v-if="loading" class="p-8 text-center">
      <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8 mx-auto text-gray-400 dark:text-gray-500" />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading deals...</p>
    </div>
    <template v-else>
      <UTable 
        v-if="deals.length > 0"
        :rows="deals" 
        :columns="columns"
        :loading="loading"
      >
        <template #title-data="{ row }">
          <a
            :href="getDealUrl(row.id)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-900 dark:text-white underline"
          >
            {{ row.title }}
          </a>
        </template>
        <template #value-data="{ row }">
          {{ formatCurrency(row.value, row.currency) }}
        </template>
        <template #contact-data="{ row }">
          <a
            :href="getContactUrl(row.contact)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-900 dark:text-white underline"
          >
            {{ row.contact }}
          </a>
        </template>
        <template #status-data="{ row }">
          {{ getStatusLabel(row.status) }}
        </template>
        <template #cdate-data="{ row }">
          {{ formatDate(row.cdate) }}
        </template>
        <template #mdate-data="{ row }">
          {{ formatDate(row.mdate) }}
        </template>
        <template #group-data="{ row }">
          <a
            :href="getPipelineUrl(row.group)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-900 dark:text-white underline"
          >
            {{ getPipelineTitle(row.group) }}
          </a>
        </template>
      </UTable>
      <div v-else class="p-8 text-center text-gray-500 dark:text-gray-400">
        No deals found.
      </div>
    </template>
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ pageFrom }} to {{ pageTo }} of {{ totalItems }} results
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
  deals: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  totalItems: {
    type: Number,
    required: true
  },
  baseUrlActiveCampaign: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:page']);

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'contact', label: 'Contact' },
  { key: 'group', label: 'Pipeline' },
  { key: 'cdate', label: 'Created' },
  { key: 'mdate', label: 'Modified' },
  { key: 'status', label: 'Status' },
  { key: 'value', label: 'Value' },
];

const itemsPerPage = 25;
const currentPage = ref(1);

// Fetch pipelines for the titles
const { data: pipelinesData } = await useFetch('/api/deals/pipelines', { 
  lazy: true,
  server: false
});

// Create a map of pipeline IDs to titles
const pipelineMap = computed(() => {
  if (!pipelinesData.value?.dealGroups) return new Map();
  
  return new Map(
    pipelinesData.value.dealGroups.map(pipeline => [
      pipeline.id.toString(),
      pipeline.title
    ])
  );
});

const getPipelineTitle = (pipelineId) => {
  return pipelineMap.value.get(pipelineId.toString()) || pipelineId;
};

const pageFrom = computed(() => ((currentPage.value - 1) * itemsPerPage) + 1);
const pageTo = computed(() => Math.min(currentPage.value * itemsPerPage, props.totalItems));

const formatCurrency = (value, currency) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  return formatter.format(value / 100); // Assuming value is in cents
};

const getStatusLabel = (status) => {
  const statusMap = {
    0: 'Open',
    1: 'Won',
    2: 'Lost'
  };
  return statusMap[status] || 'Unknown';
};

const getContactUrl = (contactId) => {
  return {
    href: `https://${props.baseUrlActiveCampaign}.activehosted.com/app/contacts/${contactId}`,
    class: 'text-gray-900 dark:text-white hover:underline'
  };
};

const getDealUrl = (dealId) => {
  return {
    href: `https://${props.baseUrlActiveCampaign}.activehosted.com/app/deals/${dealId}`,
    class: 'text-gray-900 dark:text-white hover:underline'
  };
};

const getPipelineUrl = (pipelineId) => {
  return {
    href: `https://${props.baseUrlActiveCampaign}.activehosted.com/app/deals?pipeline=${pipelineId}`,
    class: 'text-gray-900 dark:text-white hover:underline'
  };
};

const paginationUI = {
  wrapper: 'flex items-center gap-1',
  base: 'min-w-[35px] h-8 flex items-center justify-center text-sm',
  rounded: 'rounded-sm',
  active: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
  inactive: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'  // Adjust this if you want to display in a different time zone
  });
};

const updatePage = (newPage) => {
  currentPage.value = newPage;
  emit('update:page', newPage);
};
</script>
