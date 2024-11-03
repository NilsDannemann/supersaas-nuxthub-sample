<template>
  <div class="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 flex-grow">
        <USelect v-model="selectedStatus" :options="statusOptions" placeholder="Any Status" class="w-36" />
        <USelect v-model="selectedPipeline" :options="pipelineOptions" placeholder="Any Pipeline" class="w-36" />
        <UPopover :popper="{ placement: 'bottom-start' }">
          <template #default="{ isOpen }">
            <UButton 
              icon="i-heroicons-calendar-20-solid" 
              :trailing="true"
              color="white" 
              variant="solid"
              class="w-48 justify-between font-normal [&>span:last-child]:text-gray-400 dark:[&>span:last-child]:text-gray-500"
              :class="[
                isOpen ? 'ring-2 ring-primary-500 dark:ring-primary-400' : '',
                'relative'
              ]"
            >
              <span 
                :class="[
                  { 'text-gray-400 dark:text-gray-500': !selected.start },
                  'truncate max-w-[160px] block'
                ]"
              >
                {{ selected.start 
                  ? `${format(selected.start, 'd MMM, yyyy')} - ${format(selected.end, 'd MMM, yyyy')}` 
                  : 'Any Date' 
                }}
              </span>
            </UButton>
          </template>

          <template #panel="{ close }">
            <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
              <div class="hidden sm:flex flex-col py-4">
                <UButton 
                  v-for="(range, index) in ranges" 
                  :key="index" 
                  :label="range.label" 
                  color="gray" 
                  variant="ghost"
                  class="rounded-none px-6"
                  :class="[isRangeSelected(range.duration) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
                  truncate 
                  @click="() => {
                    selectRange(range.duration);
                    close();
                  }" 
                />
              </div>
              <DatePicker v-model="selected" @close="close" @handle-date-selection="handleDateSelection" />
            </div>
          </template>
        </UPopover>
        <div class="flex items-center flex-grow space-x-2">
          <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search" trailing
            @keyup.enter="handleEnterKey" />
          <UBadge v-if="activeSearch" color="black" variant="solid" size="lg" class="flex items-center pl-3">
            <span>Search: "{{ activeSearch }}"</span>
            <UButton color="white" variant="link" icon="i-heroicons-x-mark-20-solid" size="xs" class="ml-2 !p-0"
              @click="removeSearchChip" />
          </UBadge>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span v-if="hasActiveFilters" class="text-sm underline cursor-pointer text-gray-500 dark:text-gray-400"
          @click="resetFilters">
          Reset Filters
        </span>
        <UButton color="primary" label="Apply" @click="applyFilters" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { sub, format, isSameDay } from 'date-fns';

const DEFAULT_DURATION = { days: 14 };

const ranges = [
  { label: 'Any dates', duration: null },
  { label: 'Today', duration: { days: 0 } },
  { label: 'Last 7 days', duration: { days: 7 } },
  { label: 'Last 14 days', duration: { days: 14 } },
  { label: 'Last 30 days', duration: { days: 30 } },
  { label: 'Last 3 months', duration: { months: 3 } },
  { label: 'Last 6 months', duration: { months: 6 } },
  { label: 'Last year', duration: { years: 1 } }
];

const selected = ref({
  start: null,
  end: null
});

function isRangeSelected(duration) {
  if (!duration) {
    return !selected.value.start && !selected.value.end;
  }
  // Special handling for "Today"
  if (duration.days === 0) {
    const today = new Date();
    return isSameDay(selected.value.start, today) && 
           isSameDay(selected.value.end, today);
  }
  return isSameDay(selected.value.start, sub(new Date(), duration)) && 
         isSameDay(selected.value.end, new Date());
}

function selectRange(duration) {
  if (!duration) {
    selected.value = {
      start: null,
      end: null
    };
    return;
  }
  // Special handling for "Today"
  if (duration.days === 0) {
    const today = new Date();
    selected.value = {
      start: new Date(today.setHours(0, 0, 0, 0)), // Start of the day
      end: new Date(today.setHours(23, 59, 59, 999)) // End of the day
    };
  } else {
    const startDate = sub(new Date(), duration);
    selected.value = {
      start: new Date(startDate.setHours(0, 0, 0, 0)), // Start of the day
      end: new Date(new Date().setHours(23, 59, 59, 999)) // End of the day
    };
  }
}

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
  if (!pipelinesData.value?.dealGroups) return [{ label: 'Any Pipeline', value: '' }];

  return [
    { label: 'Any Pipeline', value: '' },
    ...pipelinesData.value.dealGroups.map(pipeline => ({
      label: pipeline.title,
      value: pipeline.id.toString()
    }))
  ];
});

// Only triggers the actual search/filter
const applyFilters = () => {
  // Update activeSearch from searchQuery if there is one
  if (searchQuery.value.trim()) {
    activeSearch.value = searchQuery.value.trim();
  }
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
    pipeline: selectedPipeline.value,
    dateRange: selected.value.start ? {
      start: selected.value.start,
      end: selected.value.end
    } : null
  });
};

const hasActiveFilters = computed(() => {
  const hasDateFilter = selected.value.start !== null;
                           
  return activeSearch.value || 
         selectedStatus.value || 
         selectedPipeline.value || 
         hasDateFilter;
});

const resetFilters = () => {
  searchQuery.value = '';
  activeSearch.value = '';
  selectedStatus.value = '';
  selectedPipeline.value = '';
  selected.value = {
    start: null,
    end: null
  };
  emitFilters();
};

// When a specific day is selected
function handleDateSelection(date) {
  selected.value = {
    start: new Date(new Date(date).setHours(0, 0, 0, 0)), // Start of the day
    end: new Date(new Date(date).setHours(23, 59, 59, 999)) // End of the day
  };
}
</script>

