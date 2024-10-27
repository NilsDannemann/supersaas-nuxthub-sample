<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Deals</h2>
    <div class="border border-gray-200 dark:border-white/10 rounded-lg">
      <div v-if="loading" class="p-8 text-center">
        <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8 mx-auto" />
        <p class="mt-2 text-gray-500 dark:text-gray-400">Loading deals...</p>
      </div>
      <template v-else>
        <UTable 
          v-if="deals.length > 0"
          :rows="deals" 
          :columns="columns"
          :loading="loading"
        >
          <template #title-data="{ row }">
            {{ row.title }}
          </template>
          <template #value-data="{ row }">
            {{ formatCurrency(row.value) }}
          </template>
          <template #contact-data="{ row }">
            {{ row.contact }}
          </template>
          <template #status-data="{ row }">
            {{ row.status }}
          </template>
        </UTable>
        <div v-else class="p-8 text-center text-gray-500 dark:text-gray-400">
          No deals found.
        </div>
      </template>
      <div v-if="totalItems > itemsPerPage" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Showing {{ pageFrom }} to {{ pageTo }} of {{ totalItems }} results
        </div>
        <UPagination
          v-model="page"
          :page-count="totalPages"
          :total="totalItems"
          :ui="paginationUI"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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
  }
});

const emit = defineEmits(['update:page']);

const columns = [
  { key: 'title', label: 'Deal' },
  { key: 'value', label: 'Value' },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status' },
];

const itemsPerPage = 25;
const page = ref(1);

const totalPages = computed(() => Math.ceil(props.totalItems / itemsPerPage));
const pageFrom = computed(() => ((page.value - 1) * itemsPerPage) + 1);
const pageTo = computed(() => Math.min(page.value * itemsPerPage, props.totalItems));

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

const paginationUI = {
  wrapper: 'flex items-center gap-1',
  base: 'min-w-[35px] h-8 flex items-center justify-center text-sm',
  rounded: 'rounded-sm',
  active: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
  inactive: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
};

watch(page, (newPage) => {
  emit('update:page', newPage);
});
</script>
