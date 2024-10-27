<template>
  <div class="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div class="flex items-center space-x-4">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass-20-solid"
        placeholder="Search deals..."
      />
      <UTooltip :text="regularFieldsList">
        <span class="text-sm underline cursor-help text-gray-500 dark:text-gray-400">
          {{ regularFields.length }} Regular Fields
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
const emit = defineEmits(['search']);

// Custom debounce function
const useDebounce = (value, delay = 300) => {
  const debouncedValue = ref(value);
  let timeout;

  watch(value, (newValue) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
};

const debouncedSearchQuery = useDebounce(searchQuery);

watch(debouncedSearchQuery, (newValue) => {
  emit('search', newValue);
});

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
