<template>
  <div class="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div class="flex items-center space-x-4 flex-wrap">
      <div class="flex items-center flex-grow space-x-2">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Search deals..."
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
      <USelect
        v-model="selectedStatus"
        :options="statusOptions"
        placeholder="Filter by status"
        class="w-48"
      />
      <UButton
        color="black"
        label="Search"
        @click="applyFilters"
      />
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
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const searchQuery = ref('');
const activeSearch = ref('');
const selectedStatus = ref('');
const emit = defineEmits(['filter']);

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Open', value: '0' },
  { label: 'Won', value: '1' },
  { label: 'Lost', value: '2' }
];

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
    status: selectedStatus.value
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

// Fetch data when component is mounted
refresh();
</script>
