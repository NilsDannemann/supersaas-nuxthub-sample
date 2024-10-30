<template>
  <div class="border border-gray-200 dark:border-white/10 rounded-lg mb-4">
    <div class="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
      <!-- Left side: Metric selector -->
      <USelect
        v-model="selectedMetric"
        :options="metricOptions"
        size="sm"
        class="w-36"
      />
      
      <!-- Right side: Navigation controls using UButtonGroup -->
      <UButtonGroup size="sm" class="w-36">
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
          class="flex-1 !px-0 flex items-center justify-center disabled:bg-white dark:disabled:bg-gray-900"
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
      <Bar 
        v-if="chartData" 
        :data="chartData" 
        :options="chartOptions"
        class="h-[300px]"
      />
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

// Register ChartJS components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const selectedMetric = ref('number');
const metricOptions = [
  { label: 'Number', value: 'number' },
  { label: 'Value', value: 'value' }
];

// Time period navigation
const currentDate = ref(new Date());
const isLoading = ref(false);

// Computed property to check if we're viewing the current period
const isCurrentPeriod = computed(() => {
  const now = new Date();
  return currentDate.value.getFullYear() === now.getFullYear();
});

// Format the current period for display
const currentPeriodLabel = computed(() => {
  return currentDate.value.getFullYear().toString();
});

// Navigate between periods
const navigatePeriod = (direction) => {
  isLoading.value = true;
  
  // Update the current date
  const newDate = new Date(currentDate.value);
  newDate.setFullYear(newDate.getFullYear() + direction);
  currentDate.value = newDate;
  
  // Here you would typically fetch new data for the selected period
  // For now, we'll just simulate a loading state
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
};

// Modified mock data function to generate data for any year
const generateMockDataForYear = (year) => {
  // This is a placeholder that returns the existing mockData
  // Later this will be replaced with real API data
  return mockData;
};

// Update chartData computed to use the current year
const chartData = computed(() => {
  const yearData = generateMockDataForYear(currentDate.value.getFullYear());
  return {
    labels: Object.keys(yearData),
    datasets: pipelines.flatMap((pipeline, index) => 
      createPipelineDataset(pipeline, yearData, index * (selectedMetric.value === 'number' ? 3 : 1))
    )
  };
});

// Modified chart options with dynamic tooltip
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    },
    tooltip: {
      enabled: true,
      mode: 'nearest',
      intersect: true,
      reverse: true,
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
          return selectedMetric.value === 'value' 
            ? `${label}: ${new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(value)}`
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
            }).format(value);
          }
          return value;
        }
      }
    }
  },
  barPercentage: 0.9,
  categoryPercentage: 0.9
}));

// Updated mock data for full year
const mockData = {
  'Jan': { 
    sales: { won: 8, lost: 3, open: 5, valueWon: 50000, valueLost: 20000, valueOpen: 10000 },
    marketing: { won: 6, lost: 2, open: 4, valueWon: 40000, valueLost: 15000, valueOpen: 5000 },
    partnerships: { won: 7, lost: 2, open: 4, valueWon: 45000, valueLost: 15000, valueOpen: 10000 }
  },
  'Feb': { 
    sales: { won: 9, lost: 4, open: 6, valueWon: 60000, valueLost: 20000, valueOpen: 10000 },
    marketing: { won: 7, lost: 3, open: 5, valueWon: 45000, valueLost: 15000, valueOpen: 10000 },
    partnerships: { won: 8, lost: 3, open: 5, valueWon: 50000, valueLost: 20000, valueOpen: 10000 }
  },
  'Mar': {
    sales: { won: 10, lost: 3, open: 4, valueWon: 65000, valueLost: 18000, valueOpen: 12000 },
    marketing: { won: 8, lost: 2, open: 6, valueWon: 48000, valueLost: 16000, valueOpen: 8000 },
    partnerships: { won: 9, lost: 4, open: 3, valueWon: 55000, valueLost: 22000, valueOpen: 9000 }
  },
  'Apr': {
    sales: { won: 11, lost: 4, open: 5, valueWon: 70000, valueLost: 25000, valueOpen: 15000 },
    marketing: { won: 9, lost: 3, open: 4, valueWon: 52000, valueLost: 18000, valueOpen: 7000 },
    partnerships: { won: 8, lost: 2, open: 6, valueWon: 48000, valueLost: 16000, valueOpen: 11000 }
  },
  'May': {
    sales: { won: 12, lost: 3, open: 6, valueWon: 75000, valueLost: 22000, valueOpen: 13000 },
    marketing: { won: 10, lost: 4, open: 3, valueWon: 58000, valueLost: 20000, valueOpen: 9000 },
    partnerships: { won: 9, lost: 3, open: 5, valueWon: 54000, valueLost: 19000, valueOpen: 12000 }
  },
  'Jun': {
    sales: { won: 10, lost: 5, open: 4, valueWon: 68000, valueLost: 28000, valueOpen: 11000 },
    marketing: { won: 8, lost: 3, open: 5, valueWon: 50000, valueLost: 17000, valueOpen: 10000 },
    partnerships: { won: 11, lost: 2, open: 4, valueWon: 62000, valueLost: 15000, valueOpen: 8000 }
  },
  'Jul': {
    sales: { won: 13, lost: 4, open: 5, valueWon: 80000, valueLost: 24000, valueOpen: 14000 },
    marketing: { won: 11, lost: 3, open: 4, valueWon: 65000, valueLost: 19000, valueOpen: 8000 },
    partnerships: { won: 10, lost: 4, open: 6, valueWon: 58000, valueLost: 21000, valueOpen: 13000 }
  },
  'Aug': {
    sales: { won: 12, lost: 3, open: 6, valueWon: 72000, valueLost: 20000, valueOpen: 15000 },
    marketing: { won: 9, lost: 4, open: 5, valueWon: 54000, valueLost: 22000, valueOpen: 11000 },
    partnerships: { won: 11, lost: 3, open: 4, valueWon: 64000, valueLost: 18000, valueOpen: 9000 }
  },
  'Sep': {
    sales: { won: 14, lost: 4, open: 5, valueWon: 85000, valueLost: 26000, valueOpen: 12000 },
    marketing: { won: 12, lost: 3, open: 4, valueWon: 70000, valueLost: 21000, valueOpen: 10000 },
    partnerships: { won: 10, lost: 5, open: 6, valueWon: 60000, valueLost: 24000, valueOpen: 14000 }
  },
  'Oct': {
    sales: { won: 15, lost: 3, open: 6, valueWon: 90000, valueLost: 23000, valueOpen: 16000 },
    marketing: { won: 13, lost: 4, open: 5, valueWon: 75000, valueLost: 24000, valueOpen: 12000 },
    partnerships: { won: 12, lost: 3, open: 4, valueWon: 68000, valueLost: 20000, valueOpen: 10000 }
  },
  'Nov': {
    sales: { won: 13, lost: 5, open: 4, valueWon: 82000, valueLost: 28000, valueOpen: 13000 },
    marketing: { won: 11, lost: 3, open: 6, valueWon: 66000, valueLost: 19000, valueOpen: 14000 },
    partnerships: { won: 14, lost: 4, open: 5, valueWon: 78000, valueLost: 23000, valueOpen: 11000 }
  },
  'Dec': {
    sales: { won: 16, lost: 4, open: 5, valueWon: 95000, valueLost: 25000, valueOpen: 15000 },
    marketing: { won: 14, lost: 3, open: 4, valueWon: 80000, valueLost: 20000, valueOpen: 11000 },
    partnerships: { won: 13, lost: 4, open: 6, valueWon: 72000, valueLost: 22000, valueOpen: 13000 }
  }
};

const pipelines = [
  'Sales',
  'Marketing',
  'Partnerships'
];

// Modified helper function to reorder segments (lost on top, won on bottom)
const createPipelineDataset = (pipelineName, data, orderOffset) => {
  const isNumber = selectedMetric.value === 'number';
  const metrics = isNumber 
    ? ['lost', 'open', 'won']  // Lost on top, won on bottom
    : ['valueLost', 'valueOpen', 'valueWon'];
  
  const colors = ['#BAE6FD', '#38BDF8', '#0EA5E9'];  // Light to dark
  const labels = ['Lost', 'Open', 'Won'];

  return metrics.map((metric, index) => ({
    label: `${labels[index]} (${pipelineName})`,
    data: Object.values(data).map(d => d[pipelineName.toLowerCase()][metric]),
    backgroundColor: colors[index],
    stack: pipelineName,
    borderRadius: index === 0 ? {  // Now applies to 'Lost' segment (top)
      topLeft: 4,
      topRight: 4
    } : undefined,
    borderSkipped: false,
    order: orderOffset + (2 - index)  // Reverse the order (2,1,0 instead of 0,1,2)
  }));
};
</script>