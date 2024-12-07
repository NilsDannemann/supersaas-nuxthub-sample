<template>
  <div class="border border-gray-200 dark:border-white/10 rounded-lg mb-4">
    <div class="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
      <div class="flex gap-2">
        <!-- Left side: Metric and TimeFrame selectors -->
        <USelect
          v-model="selectedMetric"
          :options="metricOptions"
          size="sm"
          class="w-36"
        />
        <USelect
          v-model="selectedTimeFrame"
          :options="timeFrameOptions"
          size="sm"
          class="w-36"
        />
      </div>
      
      <!-- Right side: Navigation controls using UButtonGroup -->
      <UButtonGroup size="sm" class="min-w-[9rem] whitespace-nowrap">
        <UButton
          color="white"
          variant="solid"
          :disabled="isLoading"
          @click="navigatePeriod(-1)"
          class="!px-2 disabled:bg-white dark:disabled:bg-gray-900"
        >
          <UIcon 
            name="ph-caret-left-bold" 
            class="w-3 h-3"
            :class="isLoading ? 'text-gray-300 dark:text-gray-700' : ''" 
          />
        </UButton>
        <UButton
          color="white"
          variant="solid"
          :disabled="true"
          class="flex-1 !px-2 flex items-center justify-center disabled:bg-white dark:disabled:bg-gray-900"
        >
          <span class="text-center">{{ currentPeriodLabel }}</span>
        </UButton>
        <UButton
          color="white"
          variant="solid"
          :disabled="isLoading || isCurrentPeriod"
          @click="navigatePeriod(1)"
          class="!px-2 disabled:bg-white dark:disabled:bg-gray-900"
        >
          <UIcon 
            name="ph-caret-right-bold" 
            class="w-3 h-3"
            :class="(isLoading || isCurrentPeriod) ? 'text-gray-300 dark:text-gray-700' : ''" 
          />
        </UButton>
      </UButtonGroup>
    </div>
    <div class="p-8">
      <div 
        v-if="props.loading || isLoading" 
        class="h-[300px] flex flex-col items-center justify-center gap-2"
      >
        <UIcon 
          name="i-heroicons-arrow-path-20-solid"
          class="w-8 h-8 animate-spin text-gray-400"
        />
        <span class="text-sm text-gray-500">Loading data...</span>
      </div>
      <div 
        v-else-if="error" 
        class="h-[300px] flex flex-col items-center justify-center text-gray-500 gap-2"
      >
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-8 h-8 text-amber-500"
        />
        <p>{{ error }}</p>
      </div>
      <Bar 
        v-else-if="chartData && Object.keys(chartData.datasets || {}).length > 0" 
        :data="chartData" 
        :options="chartOptions"
        class="h-[300px]"
      />
      <div 
        v-else 
        class="h-[300px] flex items-center justify-center text-gray-500"
      >
        No data available for the selected period
      </div>
    </div>
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

// Move all refs to the top
const error = ref(null);
const selectedMetric = ref('number');
const selectedTimeFrame = ref('yearly');
const currentDate = ref(new Date());
const isLoading = ref(false);
const timeframeMaxValue = ref(0);

const metricOptions = [
  { label: 'Number', value: 'number' },
  { label: 'Value', value: 'value' }
];

const timeFrameOptions = [
  { label: 'Year', value: 'yearly' },
  { label: 'Month', value: 'monthly' },
  { label: 'Week', value: 'weekly' }
];

// Register ChartJS components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

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
  pipelinesData: {
    type: Object,
    required: true
  }
});

// Add currency formatting helper
const formatCurrency = (value, currency = 'EUR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100); // Convert cents to whole currency units
};

// Add validation helper
const validateDeals = (deals) => {
  if (!Array.isArray(deals)) {
    throw new Error('Deals must be an array');
  }

  const requiredFields = ['id', 'value', 'currency', 'status', 'group', 'cdate'];
  const invalidDeals = deals.filter(deal => 
    !deal || typeof deal !== 'object' ||
    requiredFields.some(field => !(field in deal))
  );

  if (invalidDeals.length > 0) {
    throw new Error(`Invalid deal data: Missing required fields in ${invalidDeals.length} deals`);
  }
};

// Update aggregateDeals to filter by year/month/week based on selected timeframe
const aggregateDeals = (deals, timeframe, date) => {
  try {
    const result = {};
    
    // Initialize periods based on timeframe
    const periods = getPeriods(timeframe, date);
    if (!periods.length) {
      throw new Error('Invalid timeframe or date');
    }

    periods.forEach(period => {
      result[period] = {};
    });

    // Get date range for current view
    const viewRange = getDateRangeForPeriod(date, timeframe);
    const viewStart = viewRange.start;
    const viewEnd = viewRange.end;

    // Group deals by period and pipeline
    deals.forEach((deal, index) => {
      try {
        const dealDate = new Date(deal.cdate);
        if (isNaN(dealDate.getTime())) {
          throw new Error(`Invalid date format in deal at index ${index}`);
        }

        // Skip if deal is not in the current view period
        if (dealDate < viewStart || dealDate > viewEnd) return;

        const period = getPeriodKey(dealDate, timeframe);
        const pipelineId = deal.group;
        
        // Skip if period is not in our current view
        if (!result[period]) return;
        
        // Initialize pipeline data if needed
        if (!result[period][pipelineId]) {
          result[period][pipelineId] = {
            won: 0, lost: 0, open: 0,
            valueWon: 0, valueLost: 0, valueOpen: 0,
            currency: deal.currency
          };
        }
        
        // Validate and convert value
        const value = parseInt(deal.value);
        if (isNaN(value)) {
          console.warn(`Invalid deal value for deal ${deal.id}, using 0`);
        }
        
        // Increment counts and values based on status
        switch (deal.status) {
          case '1': // Won
            result[period][pipelineId].won++;
            result[period][pipelineId].valueWon += value || 0;
            break;
          case '2': // Lost
            result[period][pipelineId].lost++;
            result[period][pipelineId].valueLost += value || 0;
            break;
          case '0': // Open
          default:
            result[period][pipelineId].open++;
            result[period][pipelineId].valueOpen += value || 0;
        }
      } catch (err) {
        console.warn(`Error processing deal at index ${index}:`, err);
        // Continue processing other deals
      }
    });

    console.log('Timeframe:', timeframe);
    console.log('View Range:', viewStart, viewEnd);
    console.log('Result:', JSON.stringify(result, null, 2));

    return result;
  } catch (err) {
    console.error('Error aggregating deals:', err);
    throw err;
  }
};

// Update getPeriods for monthly view
const getPeriods = (timeframe, date) => {
  const periods = [];
  const year = date.getFullYear();
  
  switch (timeframe) {
    case 'yearly':
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    case 'monthly':
      // Get the first and last date of the month
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Start from the first week
      let currentDate = new Date(monthStart);
      
      // Keep track of week numbers
      let weekNumber = 1;
      
      while (currentDate <= monthEnd) {
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        // Format the date range
        const startDay = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(currentDate);
        const endDay = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(
          weekEnd > monthEnd ? monthEnd : weekEnd
        );
        
        const periodKey = `Week ${weekNumber} (${startDay}-${endDay})`;
        periods.push(periodKey);
        
        currentDate.setDate(currentDate.getDate() + 7);
        weekNumber++;
      }
      
      console.log('Monthly periods:', periods);
      return periods;
  
    case 'weekly':
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }
  
  return periods;
};

// Update getPeriodKey for monthly view to match
const getPeriodKey = (date, timeframe) => {
  switch (timeframe) {
    case 'yearly':
      return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    case 'monthly':
      // Calculate week number within the month
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const weekNumber = Math.ceil((date.getDate() + monthStart.getDay()) / 7);
      
      // Calculate the start and end days for this week
      const weekStart = new Date(monthStart);
      weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Format the date range
      const startDay = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(weekStart);
      const endDay = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(weekEnd);
      
      const periodKey = `Week ${weekNumber} (${startDay}-${endDay})`;
      console.log('Deal date:', date, 'Period key:', periodKey);
      return periodKey;
    case 'weekly':
      return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    default:
      return '';
  }
};

// Update formatPeriodKey to match
const formatPeriodKey = (date, timeframe) => {
  switch (timeframe) {
    case 'yearly':
      return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    case 'monthly':
      const weekStart = new Date(date);
      const weekEnd = new Date(date);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const weekNumber = Math.ceil((date.getDate() + monthStart.getDay()) / 7);
      
      // Keep the week number format consistent
      return `Week ${weekNumber}`;
    case 'weekly':
      return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    default:
      return '';
  }
};

// Add startOfWeek helper function
const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

// Add pipelineMap computed
const pipelineMap = computed(() => {
  if (!props.pipelinesData?.dealGroups) return new Map();
  
  return new Map(
    props.pipelinesData.dealGroups.map(pipeline => [
      pipeline.id.toString(),
      pipeline.title
    ])
  );
});

// Add getPipelineTitle function
const getPipelineTitle = (pipelineId) => {
  return pipelineMap.value.get(pipelineId.toString()) || pipelineId;
};

// Update chartData computed to handle loading state
const chartData = computed(() => {
  try {
    // Reset error state
    error.value = null;

    // Don't validate while loading
    if (props.loading) {
      return null;
    }

    // Validate deals data
    validateDeals(props.deals);

    // Validate pipelinesData
    if (!props.pipelinesData?.dealGroups) {
      throw new Error('Pipeline data is missing or invalid');
    }

    // Check if pipelines are still loading (empty array)
    if (props.pipelinesData.dealGroups.length === 0) {
      throw new Error('Loading pipeline data...');
    }

    const aggregatedData = aggregateDeals(props.deals, selectedTimeFrame.value, currentDate.value);
    console.log('Aggregated Data:', aggregatedData);
    
    const pipelineIds = [...new Set(
      Object.values(aggregatedData)
        .flatMap(periodData => Object.keys(periodData))
    )];
    console.log('Pipeline IDs:', pipelineIds);

    const datasets = pipelineIds.flatMap((pipelineId, index) => {
      const datasets = createPipelineDataset(
        getPipelineTitle(pipelineId),
        aggregatedData,
        index * (selectedMetric.value === 'number' ? 3 : 1),
        pipelineId
      );
      console.log(`Datasets for pipeline ${pipelineId}:`, datasets);
      return datasets;
    });

    return {
      labels: Object.keys(aggregatedData),
      datasets
    };
  } catch (err) {
    error.value = err.message;
    console.error('Chart data error:', err);
    return null;
  }
});

// Update createPipelineDataset to correctly handle rounded corners
const createPipelineDataset = (pipelineName, data, orderOffset, pipelineId) => {
  const isNumber = selectedMetric.value === 'number';
  const metrics = isNumber 
    ? ['lost', 'open', 'won']
    : ['valueLost', 'valueOpen', 'valueWon'];
  
  const colors = ['#BAE6FD', '#38BDF8', '#0EA5E9'];
  const labels = ['Lost', 'Open', 'Won'];

  // Find the first non-zero metric for each period (starting from the top)
  const firstNonZeroMetrics = Object.values(data).map(periodData => {
    const pipelineData = periodData[pipelineId] || {};
    // Start from index 0 (top of the stack)
    for (let i = 0; i < metrics.length; i++) {
      if (pipelineData[metrics[i]] > 0) {
        return metrics[i];
      }
    }
    return metrics[0]; // Default to first metric if all are zero
  });

  return metrics.map((metric, index) => ({
    label: `${labels[index]} (${pipelineName})`,
    data: Object.values(data).map((periodData, periodIndex) => {
      const value = periodData[pipelineId]?.[metric] || 0;
      return value;
    }),
    backgroundColor: colors[index],
    stack: pipelineName,
    borderSkipped: false,
    // Apply borderRadius only if this metric is the first non-zero value for its period
    borderRadius: Object.values(data).map((_, periodIndex) => {
      const isFirstNonZero = firstNonZeroMetrics[periodIndex] === metric;
      return isFirstNonZero ? {
        topLeft: 4,
        topRight: 4,
        bottomLeft: 0,
        bottomRight: 0
      } : 0;
    }),
    order: orderOffset + (2 - index)
  }));
};

// Update watchers for data changes and timeframe changes
watch(() => props.deals, () => {
  // Reset to yearly view and current year when data changes
  selectedTimeFrame.value = 'yearly';
  currentDate.value = new Date();
  // Calculate new max value immediately
  timeframeMaxValue.value = findMaxValueForTimeframe(props.deals, 'yearly');
}, { deep: true });

watch(selectedTimeFrame, (newTimeframe) => {
  // Calculate new max value for the new timeframe type
  timeframeMaxValue.value = findMaxValueForTimeframe(props.deals, newTimeframe);
});

// Simplify findMaxValueForTimeframe to use existing aggregateDeals
const findMaxValueForTimeframe = (deals, timeframe) => {
  let maxValue = 0;
  
  // Use existing aggregateDeals function to get the data
  const aggregatedData = aggregateDeals(deals, timeframe, currentDate.value);
  
  // Find max value across all periods
  Object.values(aggregatedData).forEach(periodData => {
    Object.values(periodData).forEach(pipelineData => {
      if (selectedMetric.value === 'number') {
        const total = pipelineData.won + pipelineData.lost + pipelineData.open;
        maxValue = Math.max(maxValue, total);
      } else {
        const total = pipelineData.valueWon + pipelineData.valueLost + pipelineData.valueOpen;
        maxValue = Math.max(maxValue, total);
      }
    });
  });

  // Round up to nice number
  if (maxValue === 0) return 10;
  const magnitude = Math.floor(Math.log10(maxValue));
  const baseStep = Math.pow(10, magnitude);
  const step = baseStep * (maxValue / baseStep <= 5 ? 1 : 2);
  return Math.ceil(maxValue / step) * step;
};

// Keep findMaxValue simple
const findMaxValue = () => {
  if (timeframeMaxValue.value === 0) {
    timeframeMaxValue.value = findMaxValueForTimeframe(props.deals, selectedTimeFrame.value);
  }
  return timeframeMaxValue.value;
};

// Update chartOptions to use simplified findMaxValue
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      mode: 'nearest',
      intersect: true,
      callbacks: {
        title: (context) => {
          if (context[0]) {
            const stack = context[0].dataset.stack;
            const month = context[0].label;
            return `${stack} - ${month}`;
          }
          return '';
        },
        label: (context) => {
          const label = context.dataset.label.split(' ')[0];
          const value = context.parsed.y;
          const currency = context.dataset.currency || 'EUR';
          
          return selectedMetric.value === 'value' 
            ? `${label}: ${formatCurrency(value, currency)}`
            : `${label}: ${value}`;
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      beginAtZero: true,
      max: findMaxValue(),
      ticks: {
        callback: (value) => {
          if (selectedMetric.value === 'value') {
            return new Intl.NumberFormat('en-US', { 
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(value / 100);
          }
          return value;
        }
      }
    }
  }
}));

// Update navigatePeriod to not emit events
const navigatePeriod = (direction) => {
  isLoading.value = true;
  
  const newDate = new Date(currentDate.value);
  switch (selectedTimeFrame.value) {
    case 'yearly':
      newDate.setFullYear(newDate.getFullYear() + direction);
      break;
    case 'monthly':
      newDate.setMonth(newDate.getMonth() + direction);
      break;
    case 'weekly':
      newDate.setDate(newDate.getDate() + (direction * 7));
      break;
  }
  currentDate.value = newDate;
  
  // Just update loading state after a short delay to show transition
  setTimeout(() => {
    isLoading.value = false;
  }, 100);
};

// Update getDateRangeForPeriod to be more precise
const getDateRangeForPeriod = (date, timeframe) => {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (timeframe) {
    case 'yearly':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0); // Last day of month
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + (6 - day));
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
};

// Add computed for current period check
const isCurrentPeriod = computed(() => {
  const now = new Date();
  const current = currentDate.value;
  
  switch (selectedTimeFrame.value) {
    case 'yearly':
      return current.getFullYear() === now.getFullYear();
    case 'monthly':
      return current.getFullYear() === now.getFullYear() 
        && current.getMonth() === now.getMonth();
    case 'weekly':
      const currentWeekStart = startOfWeek(current);
      const nowWeekStart = startOfWeek(now);
      return currentWeekStart.getTime() === nowWeekStart.getTime();
  }
});

// Add computed for period label
const currentPeriodLabel = computed(() => {
  const date = currentDate.value;
  
  switch (selectedTimeFrame.value) {
    case 'yearly':
      return date.getFullYear().toString();
    case 'monthly':
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short',
        year: 'numeric' 
      }).format(date);
    case 'weekly':
      const weekStart = new Date(date);
      const weekEnd = new Date(date);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric'
      }).format(weekStart)} - ${new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric'
      }).format(weekEnd)}`;
  }
});

// Watch loading prop
watch(() => props.loading, (newValue) => {
  isLoading.value = newValue;
});
</script>