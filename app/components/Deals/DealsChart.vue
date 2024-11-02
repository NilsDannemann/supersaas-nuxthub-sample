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
      <div v-if="isLoading" class="h-[300px] flex flex-col items-center justify-center gap-2">
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
        <pre class="text-xs mt-2 max-w-lg overflow-auto">
          Pipeline Data: {{ JSON.stringify(props.pipelinesData, null, 2) }}
        </pre>
      </div>
      <Bar 
        v-else-if="chartData" 
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
    <div class="p-4 border-b border-gray-200 dark:border-white/10">
      <pre class="text-xs text-gray-500 dark:text-gray-400 overflow-auto max-h-32 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
        {{ deals }}
      </pre>
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

// Update aggregateDeals to track currencies
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

    // Group deals by period and pipeline
    deals.forEach((deal, index) => {
      try {
        const dealDate = new Date(deal.cdate);
        if (isNaN(dealDate.getTime())) {
          throw new Error(`Invalid date format in deal at index ${index}`);
        }

        const period = getPeriodKey(dealDate, timeframe);
        const pipelineId = deal.group;
        
        // Skip if deal is not in the current view period
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

    return result;
  } catch (err) {
    console.error('Error aggregating deals:', err);
    throw err;
  }
};

const getPeriods = (timeframe, date) => {
  const periods = [];
  const year = date.getFullYear();
  
  switch (timeframe) {
    case 'yearly':
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    case 'monthly':
      // Generate weeks in the month
      const startDate = new Date(year, date.getMonth(), 1);
      const endDate = new Date(year, date.getMonth() + 1, 0);
      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 7)) {
        periods.push(formatPeriodKey(d, 'monthly'));
      }
      return periods;
    
    case 'weekly':
      // Generate days in the week
      const weekStart = startOfWeek(date);
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        periods.push(formatPeriodKey(d, 'weekly'));
      }
      return periods;
  }
  
  return periods;
};

const getPeriodKey = (date, timeframe) => {
  return formatPeriodKey(date, timeframe);
};

const formatPeriodKey = (date, timeframe) => {
  switch (timeframe) {
    case 'yearly':
      return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    case 'monthly':
      // Get week number within the month
      const weekStart = new Date(date);
      const weekEnd = new Date(date);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Calculate week number (1-based)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const weekNumber = Math.ceil((date.getDate() + monthStart.getDay()) / 7);
      
      // If the week spans across months, only show the dates within the current month
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const displayStart = weekStart < monthStart ? monthStart : weekStart;
      const displayEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
      
      return `Week ${weekNumber} (${displayStart.getDate()}-${displayEnd.getDate()})`;
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

// Update createPipelineDataset to accept pipelineId
const createPipelineDataset = (pipelineName, data, orderOffset, pipelineId) => {
  const isNumber = selectedMetric.value === 'number';
  const metrics = isNumber 
    ? ['lost', 'open', 'won']
    : ['valueLost', 'valueOpen', 'valueWon'];
  
  const colors = ['#BAE6FD', '#38BDF8', '#0EA5E9'];
  const labels = ['Lost', 'Open', 'Won'];

  return metrics.map((metric, index) => ({
    label: `${labels[index]} (${pipelineName})`,
    data: Object.values(data).map(periodData => {
      const value = periodData[pipelineId]?.[metric] || 0;
      console.log(`Value for ${pipelineName} - ${metric}:`, value);
      return value;
    }),
    backgroundColor: colors[index],
    stack: pipelineName,
    borderRadius: index === 0 ? {
      topLeft: 4,
      topRight: 4
    } : undefined,
    borderSkipped: false,
    order: orderOffset + (2 - index)
  }));
};

// Update chartOptions to handle currency in tooltips
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
      ticks: {
        callback: (value) => {
          if (selectedMetric.value === 'value') {
            return new Intl.NumberFormat('en-US', { 
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(value / 100); // Convert cents to whole units
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

// Add helper to get date range for period
const getDateRangeForPeriod = (date, timeframe) => {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (timeframe) {
    case 'yearly':
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
    case 'monthly':
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
      break;
    case 'weekly':
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      end.setDate(end.getDate() + (6 - day));
      break;
  }
  
  // Set time to start/end of day
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
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