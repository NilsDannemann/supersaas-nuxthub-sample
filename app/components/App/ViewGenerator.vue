<template>
  <AppModal
    :model-value="modelValue"
    title="Generate Custom View"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex flex-col h-full max-w-3xl mx-auto">
      <!-- Stacked options -->
      <div class="space-y-4">
        <!-- Chart View -->
        <div 
          class="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
          @click="$emit('generate', 'chart')"
        >
          <div class="flex items-center gap-6">
            <div class="flex-shrink-0">
              <div class="p-3 rounded-lg bg-primary-50 dark:bg-primary-950">
                <UIcon name="i-ph-chart-line-up-duotone" class="w-8 h-8 text-primary-500" />
              </div>
            </div>
            <div class="flex-grow">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">Chart View</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Visualize trends and patterns in your deal data over time.</p>
            </div>
            <UIcon 
              name="i-heroicons-arrow-right-20-solid" 
              class="flex-shrink-0 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 text-primary-500 w-5 h-5"
            />
          </div>
        </div>

        <!-- Table View -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 opacity-50">
          <div class="flex items-center gap-6">
            <div class="flex-shrink-0">
              <div class="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <UIcon name="i-ph-table-duotone" class="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div class="flex-grow">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">Table View</h3>
                <span class="inline-flex items-center font-medium text-xs px-1.5 py-0.5 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 flex-shrink-0 rounded">
                  Coming Soon
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">View and manage your deals in a customizable table format.</p>
            </div>
          </div>
        </div>

        <!-- Graph View -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 opacity-50">
          <div class="flex items-center gap-6">
            <div class="flex-shrink-0">
              <div class="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <UIcon name="i-ph-graph-duotone" class="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div class="flex-grow">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">Graph View</h3>
                <span class="inline-flex items-center font-medium text-xs px-1.5 py-0.5 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 flex-shrink-0 rounded">
                  Coming Soon
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Explore relationships between deals in an interactive graph.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom section with additional info -->
      <div class="mt-auto pt-8 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          More visualization options coming soon
        </p>
      </div>
    </div>
  </AppModal>
</template>

<script setup>
import AppModal from '~/components/App/Modal.vue';

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

defineEmits(['update:modelValue', 'generate']);
</script> 