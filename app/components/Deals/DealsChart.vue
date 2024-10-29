<template>
  <div class="border border-gray-200 dark:border-white/10 rounded-lg mb-4">
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

// Mock data for 10 pipelines across all months
const mockData = {
  'Jan': { 
    sales: { won: 8, lost: 3, open: 5 },
    marketing: { won: 6, lost: 2, open: 4 },
    partnerships: { won: 7, lost: 2, open: 4 },
    enterprise: { won: 5, lost: 2, open: 3 },
    smb: { won: 12, lost: 4, open: 6 },
    retail: { won: 9, lost: 3, open: 5 },
    wholesale: { won: 7, lost: 2, open: 4 },
    international: { won: 6, lost: 2, open: 3 },
    government: { won: 4, lost: 1, open: 2 },
    education: { won: 8, lost: 3, open: 4 }
  },
  'Feb': { 
    sales: { won: 9, lost: 4, open: 6 },
    marketing: { won: 7, lost: 3, open: 5 },
    partnerships: { won: 8, lost: 3, open: 5 },
    enterprise: { won: 6, lost: 2, open: 4 },
    smb: { won: 13, lost: 5, open: 7 },
    retail: { won: 10, lost: 4, open: 6 },
    wholesale: { won: 8, lost: 3, open: 5 },
    international: { won: 7, lost: 3, open: 4 },
    government: { won: 5, lost: 2, open: 3 },
    education: { won: 9, lost: 3, open: 5 }
  },
  'Mar': { 
    sales: { won: 10, lost: 3, open: 6 },
    marketing: { won: 8, lost: 2, open: 5 },
    partnerships: { won: 9, lost: 2, open: 5 },
    enterprise: { won: 7, lost: 2, open: 4 },
    smb: { won: 14, lost: 5, open: 7 },
    retail: { won: 11, lost: 4, open: 6 },
    wholesale: { won: 9, lost: 3, open: 5 },
    international: { won: 8, lost: 3, open: 4 },
    government: { won: 6, lost: 2, open: 3 },
    education: { won: 10, lost: 3, open: 5 }
  },
  'Apr': { 
    sales: { won: 9, lost: 4, open: 5 },
    marketing: { won: 7, lost: 3, open: 4 },
    partnerships: { won: 8, lost: 3, open: 4 },
    enterprise: { won: 6, lost: 2, open: 3 },
    smb: { won: 13, lost: 5, open: 6 },
    retail: { won: 10, lost: 4, open: 5 },
    wholesale: { won: 8, lost: 3, open: 4 },
    international: { won: 7, lost: 3, open: 3 },
    government: { won: 5, lost: 2, open: 2 },
    education: { won: 9, lost: 3, open: 4 }
  },
  'May': { 
    sales: { won: 11, lost: 4, open: 6 },
    marketing: { won: 9, lost: 3, open: 5 },
    partnerships: { won: 10, lost: 3, open: 5 },
    enterprise: { won: 8, lost: 3, open: 4 },
    smb: { won: 15, lost: 5, open: 7 },
    retail: { won: 12, lost: 4, open: 6 },
    wholesale: { won: 10, lost: 3, open: 5 },
    international: { won: 9, lost: 3, open: 4 },
    government: { won: 7, lost: 2, open: 3 },
    education: { won: 11, lost: 4, open: 5 }
  },
  'Jun': { 
    sales: { won: 10, lost: 3, open: 5 },
    marketing: { won: 8, lost: 2, open: 4 },
    partnerships: { won: 9, lost: 2, open: 4 },
    enterprise: { won: 7, lost: 2, open: 3 },
    smb: { won: 14, lost: 5, open: 6 },
    retail: { won: 11, lost: 4, open: 5 },
    wholesale: { won: 9, lost: 3, open: 4 },
    international: { won: 8, lost: 3, open: 3 },
    government: { won: 6, lost: 2, open: 2 },
    education: { won: 10, lost: 3, open: 4 }
  },
  'Jul': { 
    sales: { won: 9, lost: 3, open: 5 },
    marketing: { won: 7, lost: 2, open: 4 },
    partnerships: { won: 8, lost: 2, open: 4 },
    enterprise: { won: 6, lost: 2, open: 3 },
    smb: { won: 13, lost: 5, open: 6 },
    retail: { won: 10, lost: 4, open: 5 },
    wholesale: { won: 8, lost: 3, open: 4 },
    international: { won: 7, lost: 3, open: 3 },
    government: { won: 5, lost: 2, open: 2 },
    education: { won: 9, lost: 3, open: 4 }
  },
  'Aug': { 
    sales: { won: 12, lost: 4, open: 6 },
    marketing: { won: 10, lost: 3, open: 5 },
    partnerships: { won: 11, lost: 3, open: 5 },
    enterprise: { won: 9, lost: 3, open: 4 },
    smb: { won: 16, lost: 5, open: 7 },
    retail: { won: 13, lost: 4, open: 6 },
    wholesale: { won: 11, lost: 3, open: 5 },
    international: { won: 10, lost: 3, open: 4 },
    government: { won: 8, lost: 2, open: 3 },
    education: { won: 12, lost: 4, open: 5 }
  },
  'Sep': { 
    sales: { won: 11, lost: 3, open: 5 },
    marketing: { won: 9, lost: 2, open: 4 },
    partnerships: { won: 10, lost: 2, open: 4 },
    enterprise: { won: 8, lost: 2, open: 3 },
    smb: { won: 15, lost: 5, open: 6 },
    retail: { won: 12, lost: 4, open: 5 },
    wholesale: { won: 10, lost: 3, open: 4 },
    international: { won: 9, lost: 3, open: 3 },
    government: { won: 7, lost: 2, open: 2 },
    education: { won: 11, lost: 4, open: 4 }
  },
  'Oct': { 
    sales: { won: 10, lost: 4, open: 6 },
    marketing: { won: 8, lost: 3, open: 5 },
    partnerships: { won: 9, lost: 3, open: 5 },
    enterprise: { won: 7, lost: 3, open: 4 },
    smb: { won: 14, lost: 5, open: 6 },
    retail: { won: 11, lost: 4, open: 5 },
    wholesale: { won: 9, lost: 3, open: 4 },
    international: { won: 8, lost: 3, open: 3 },
    government: { won: 6, lost: 2, open: 2 },
    education: { won: 10, lost: 3, open: 4 }
  },
  'Nov': { 
    sales: { won: 9, lost: 3, open: 5 },
    marketing: { won: 7, lost: 2, open: 4 },
    partnerships: { won: 8, lost: 2, open: 4 },
    enterprise: { won: 6, lost: 2, open: 3 },
    smb: { won: 13, lost: 5, open: 6 },
    retail: { won: 10, lost: 4, open: 5 },
    wholesale: { won: 8, lost: 3, open: 4 },
    international: { won: 7, lost: 3, open: 3 },
    government: { won: 5, lost: 2, open: 2 },
    education: { won: 9, lost: 3, open: 4 }
  },
  'Dec': { 
    sales: { won: 11, lost: 4, open: 6 },
    marketing: { won: 9, lost: 3, open: 5 },
    partnerships: { won: 10, lost: 3, open: 5 },
    enterprise: { won: 8, lost: 3, open: 4 },
    smb: { won: 15, lost: 5, open: 8 },
    retail: { won: 12, lost: 4, open: 6 },
    wholesale: { won: 10, lost: 3, open: 5 },
    international: { won: 9, lost: 3, open: 4 },
    government: { won: 7, lost: 2, open: 3 },
    education: { won: 11, lost: 4, open: 5 }
  }
};

// Helper function to create dataset for a pipeline
const createPipelineDataset = (pipelineName, data, orderOffset) => [
  {
    label: `Won (${pipelineName})`,
    data: Object.values(data).map(d => d[pipelineName.toLowerCase()].won),
    backgroundColor: '#0EA5E9',
    stack: pipelineName,
    borderSkipped: false,
    order: orderOffset
  },
  {
    label: `Lost (${pipelineName})`,
    data: Object.values(data).map(d => d[pipelineName.toLowerCase()].lost),
    backgroundColor: '#38BDF8',
    stack: pipelineName,
    borderSkipped: false,
    order: orderOffset + 1
  },
  {
    label: `Open (${pipelineName})`,
    data: Object.values(data).map(d => d[pipelineName.toLowerCase()].open),
    backgroundColor: '#BAE6FD',
    stack: pipelineName,
    borderRadius: {
      topLeft: 4,
      topRight: 4
    },
    borderSkipped: false,
    order: orderOffset + 2
  }
];

const pipelines = [
  'Sales',
  'Marketing',
  'Partnerships',
  'Enterprise',
  'SMB',
  'Retail',
  'Wholesale',
  'International',
  'Government',
  'Education'
];

const chartData = {
  labels: Object.keys(mockData),
  datasets: pipelines.flatMap((pipeline, index) => 
    createPipelineDataset(pipeline, mockData, index * 3)
  )
};

const chartOptions = {
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
          return `${label}: ${context.parsed.y}`;
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
      beginAtZero: true
    }
  },
  barPercentage: 0.9,
  categoryPercentage: 0.9
};
</script>