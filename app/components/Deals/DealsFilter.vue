<template>
  <div class="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
    <h3 class="text-lg font-semibold mb-4">Custom Deal Fields</h3>
    <div v-if="pending" class="text-gray-600 dark:text-gray-400">
      Loading custom fields...
    </div>
    <div v-else-if="error" class="text-red-600 dark:text-gray-400">
      {{ error }}
    </div>
    <pre v-else-if="customFields.length" class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
      {{ JSON.stringify(customFields, null, 2) }}
    </pre>
    <div v-else class="text-gray-600 dark:text-gray-400">
      No custom fields found.
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const { data: customFieldsData, pending, error, refresh } = await useFetch('/api/deals/custom-fields', {
  lazy: true,
  server: false, // This ensures the fetch happens on the client-side
});

const customFields = ref([]);

watch(customFieldsData, (newData) => {
  if (newData && newData.dealCustomFieldMeta) {
    customFields.value = newData.dealCustomFieldMeta;
  } else {
    customFields.value = [];
  }
}, { immediate: true });

// Fetch data when component is mounted
refresh();
</script>
