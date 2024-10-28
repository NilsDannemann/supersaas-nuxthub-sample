<template>
  <AppPageContainer title="Deals">
    <template #description>
      <div class="flex items-center gap-4">
        <span>{{ totalItems }} Deals</span>
        <UTooltip 
          :ui="{ 
            base: 'p-2 text-xs whitespace-normal h-auto'
          }"
        >
          <template #text>
            <div class="space-y-2">
              <div>
                <div class="font-medium text-gray-900 dark:text-white mb-1">Regular Fields</div>
                <div class="text-gray-500 dark:text-gray-400">{{ regularFieldsList }}</div>
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white mb-1">Custom Fields</div>
                <div class="text-gray-500 dark:text-gray-400">{{ customFieldsList }}</div>
              </div>
            </div>
          </template>
          <span class="text-sm underline cursor-pointer text-gray-500 dark:text-gray-400">
            {{ regularFields.length + customFields.length }} Fields
          </span>
        </UTooltip>
      </div>
    </template>
    <DealsFilter @filter="handleFilter" />
    <DealsTable 
      :deals="deals"
      :loading="dealsLoading"
      :totalItems="totalItems"
      :baseUrlActiveCampaign="baseUrlActiveCampaign"
      @update:page="updateDealsPage"
    />
  </AppPageContainer>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import DealsFilter from '~/components/Deals/DealsFilter.vue';
import DealsTable from '~/components/Deals/DealsTable.vue';

const deals = ref([]);
const totalItems = ref(0);
const dealsLoading = ref(true);
const baseUrlActiveCampaign = ref('');
const searchQuery = ref('');
const statusFilter = ref('');
const pipelineFilter = ref('');

const customFields = ref([]);
const regularFields = ref([]);

const { data: customFieldsData, pending, error } = await useFetch('/api/deals/custom-fields', {
  lazy: true,
  server: false,
});

watch(customFieldsData, (newData) => {
  if (newData && newData.dealCustomFieldMeta) {
    customFields.value = newData.dealCustomFieldMeta;
  } else {
    customFields.value = [];
  }
}, { immediate: true });

// Fetch regular fields from the deals API
const { data: dealsFieldsData } = await useFetch('/api/deals?limit=1', {
  lazy: true,
  server: false,
});

watch(dealsFieldsData, (newData) => {
  if (newData && newData.deals && newData.deals.length > 0) {
    regularFields.value = Object.keys(newData.deals[0]).filter(key => 
      !['id', 'owner', 'contact', 'organization'].includes(key)
    );
  } else {
    regularFields.value = [];
  }
}, { immediate: true });

// Computed properties for tooltip content
const regularFieldsList = computed(() => regularFields.value.join(', '));
const customFieldsList = computed(() => customFields.value.map(field => field.fieldLabel).join(', '));

const dealPage = ref(1);
const itemsPerPage = 25;

const { data: dealsData, refresh: refreshDeals } = await useFetch(() => `/api/deals`, { 
  lazy: true,
  immediate: false,
  query: computed(() => ({
    limit: itemsPerPage,
    offset: (dealPage.value - 1) * itemsPerPage,
    search: searchQuery.value,
    status: statusFilter.value,
    pipeline: pipelineFilter.value
  }))
});

const updateDealsPage = (newPage) => {
  dealPage.value = newPage;
};

const handleFilter = ({ search, status, pipeline }) => {
  searchQuery.value = search;
  statusFilter.value = status;
  pipelineFilter.value = pipeline;
  dealPage.value = 1; // Reset to first page when filters change
  loadDeals();
};

const loadDeals = async () => {
  dealsLoading.value = true;
  try {
    await refreshDeals();
    deals.value = dealsData.value?.deals || [];
    totalItems.value = dealsData.value?.meta?.total || 0;
    baseUrlActiveCampaign.value = dealsData.value?.baseUrlActiveCampaign || '';
  } catch (err) {
    console.error("Failed to fetch deals:", err);
  } finally {
    dealsLoading.value = false;
  }
};

watch(dealPage, loadDeals);

// Initial load
loadDeals();
</script>
