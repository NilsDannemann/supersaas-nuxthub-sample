<template>
  <div class="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 flex-grow">
        <USelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Filter Status"
          class="w-36"
        />
        <USelect
          v-model="selectedPipeline"
          :options="pipelineOptions"
          placeholder="Filter Pipelines"
          class="w-36"
        />
        <div class="flex items-center flex-grow space-x-2">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search"
            trailing
            @keyup.enter="handleEnterKey"
          />
          <UBadge
            v-if="activeSearch"
            color="black"
            variant="solid"
            size="lg"
            class="flex items-center pl-3"
          >
            <span>Search: "{{ activeSearch }}"</span>
            <UButton
              color="white"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              size="xs"
              class="ml-2 !p-0"
              @click="removeSearchChip"
            />
          </UBadge>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <UTooltip :text="regularFieldsList">
          <span class="text-sm underline cursor-help text-gray-500 dark:text-gray-400">
            {{ regularFields.length }} Fields
          </span>
        </UTooltip>
        <UTooltip :text="customFieldsList">
          <span class="text-sm underline cursor-help text-gray-500 dark:text-gray-400">
            {{ customFields.length }} Custom Fields
          </span>
        </UTooltip>
        <span
          v-if="hasActiveFilters"
          class="text-sm underline cursor-pointer text-gray-500 dark:text-gray-400"
          @click="resetFilters"
        >
          Reset Filters
        </span>
        <UButton
          color="black"
          label="Search"
          @click="applyFilters"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const searchQuery = ref('');
const activeSearch = ref('');
const selectedStatus = ref('');
const selectedPipeline = ref('');
const emit = defineEmits(['filter']);

const statusOptions = [
  { label: 'Any Status', value: '' },
  { label: 'Open', value: '0' },
  { label: 'Won', value: '1' },
  { label: 'Lost', value: '2' }
];

// Fetch pipelines for the dropdown
const { data: pipelinesData } = await useFetch('/api/deals/pipelines', {
  lazy: true,
  server: false
});

const pipelineOptions = computed(() => {
  if (!pipelinesData.value?.dealGroups) return [{ label: 'All Pipelines', value: '' }];
  
  return [
    { label: 'All Pipelines', value: '' },
    ...pipelinesData.value.dealGroups.map(pipeline => ({
      label: pipeline.title,
      value: pipeline.id.toString()
    }))
  ];
});

// Only triggers the actual search/filter
const applyFilters = () => {
  emitFilters();
};

// Just updates UI state
const handleEnterKey = () => {
  if (searchQuery.value.trim()) {
    activeSearch.value = searchQuery.value.trim();
  }
};

// Just updates UI state
const removeSearchChip = () => {
  activeSearch.value = '';
  searchQuery.value = '';
};

// Emits current filter state to parent
const emitFilters = () => {
  emit('filter', {
    search: activeSearch.value,
    status: selectedStatus.value,
    pipeline: selectedPipeline.value
  });
};

const { data: customFieldsData, pending, error, refresh } = await useFetch('/api/deals/custom-fields', {
  lazy: true,
  server: false,
});

const customFields = ref([]);
const regularFields = ref([]);

watch(customFieldsData, (newData) => {
  if (newData && newData.dealCustomFieldMeta) {
    customFields.value = newData.dealCustomFieldMeta;
  } else {
    customFields.value = [];
  }
}, { immediate: true });

// Fetch regular fields from the deals API
const { data: dealsData } = await useFetch('/api/deals?limit=1', {
  lazy: true,
  server: false,
});

watch(dealsData, (newData) => {
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

const hasActiveFilters = computed(() => {
  return activeSearch.value || selectedStatus.value || selectedPipeline.value;
});

// Only resets UI state, never triggers API call
const resetFilters = () => {
  searchQuery.value = '';
  activeSearch.value = '';
  selectedStatus.value = '';
  selectedPipeline.value = '';
};

// Fetch data when component is mounted
refresh();
</script>
