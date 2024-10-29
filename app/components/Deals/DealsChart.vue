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

// Mock data for each pipeline across all months
const mockData = {
  'Jan': { 
    sales: { won: 8, lost: 3, open: 5 },
    marketing: { won: 6, lost: 2, open: 4 },
    partnerships: { won: 7, lost: 2, open: 4 }
  },
  'Feb': { 
    sales: { won: 9, lost: 4, open: 6 },
    marketing: { won: 7, lost: 3, open: 5 },
    partnerships: { won: 8, lost: 3, open: 5 }
  },
  'Mar': { 
    sales: { won: 10, lost: 3, open: 6 },
    marketing: { won: 8, lost: 2, open: 5 },
    partnerships: { won: 9, lost: 2, open: 5 }
  },
  'Apr': { 
    sales: { won: 9, lost: 4, open: 5 },
    marketing: { won: 7, lost: 3, open: 4 },
    partnerships: { won: 8, lost: 3, open: 4 }
  },
  'May': { 
    sales: { won: 11, lost: 4, open: 6 },
    marketing: { won: 9, lost: 3, open: 5 },
    partnerships: { won: 10, lost: 3, open: 5 }
  },
  'Jun': { 
    sales: { won: 10, lost: 3, open: 5 },
    marketing: { won: 8, lost: 2, open: 4 },
    partnerships: { won: 9, lost: 2, open: 4 }
  },
  'Jul': { 
    sales: { won: 9, lost: 3, open: 5 },
    marketing: { won: 7, lost: 2, open: 4 },
    partnerships: { won: 8, lost: 2, open: 4 }
  },
  'Aug': { 
    sales: { won: 12, lost: 4, open: 6 },
    marketing: { won: 10, lost: 3, open: 5 },
    partnerships: { won: 11, lost: 3, open: 5 }
  },
  'Sep': { 
    sales: { won: 11, lost: 3, open: 5 },
    marketing: { won: 9, lost: 2, open: 4 },
    partnerships: { won: 10, lost: 2, open: 4 }
  },
  'Oct': { 
    sales: { won: 10, lost: 4, open: 6 },
    marketing: { won: 8, lost: 3, open: 5 },
    partnerships: { won: 9, lost: 3, open: 5 }
  },
  'Nov': { 
    sales: { won: 9, lost: 3, open: 5 },
    marketing: { won: 7, lost: 2, open: 4 },
    partnerships: { won: 8, lost: 2, open: 4 }
  },
  'Dec': { 
    sales: { won: 11, lost: 4, open: 6 },
    marketing: { won: 9, lost: 3, open: 5 },
    partnerships: { won: 10, lost: 3, open: 5 }
  }
};

const chartData = {
  labels: Object.keys(mockData),
  datasets: [
    // Sales Pipeline
    {
      label: 'Won (Sales)',
      data: Object.values(mockData).map(d => d.sales.won),
      backgroundColor: '#0EA5E9', // sky-500
      stack: 'Sales',
      borderSkipped: false,
      order: 1
    },
    {
      label: 'Lost (Sales)',
      data: Object.values(mockData).map(d => d.sales.lost),
      backgroundColor: '#38BDF8', // sky-400
      stack: 'Sales',
      borderSkipped: false,
      order: 2
    },
    {
      label: 'Open (Sales)',
      data: Object.values(mockData).map(d => d.sales.open),
      backgroundColor: '#BAE6FD', // sky-200
      stack: 'Sales',
      borderRadius: {
        topLeft: 4,
        topRight: 4
      },
      borderSkipped: false,
      order: 3
    },
    // Marketing Pipeline
    {
      label: 'Won (Marketing)',
      data: Object.values(mockData).map(d => d.marketing.won),
      backgroundColor: '#0EA5E9',
      stack: 'Marketing',
      borderSkipped: false,
      order: 4
    },
    {
      label: 'Lost (Marketing)',
      data: Object.values(mockData).map(d => d.marketing.lost),
      backgroundColor: '#38BDF8',
      stack: 'Marketing',
      borderSkipped: false,
      order: 5
    },
    {
      label: 'Open (Marketing)',
      data: Object.values(mockData).map(d => d.marketing.open),
      backgroundColor: '#BAE6FD',
      stack: 'Marketing',
      borderRadius: {
        topLeft: 4,
        topRight: 4
      },
      borderSkipped: false,
      order: 6
    },
    // Partnerships Pipeline
    {
      label: 'Won (Partnerships)',
      data: Object.values(mockData).map(d => d.partnerships.won),
      backgroundColor: '#0EA5E9',
      stack: 'Partnerships',
      borderSkipped: false,
      order: 7
    },
    {
      label: 'Lost (Partnerships)',
      data: Object.values(mockData).map(d => d.partnerships.lost),
      backgroundColor: '#38BDF8',
      stack: 'Partnerships',
      borderSkipped: false,
      order: 8
    },
    {
      label: 'Open (Partnerships)',
      data: Object.values(mockData).map(d => d.partnerships.open),
      backgroundColor: '#BAE6FD',
      stack: 'Partnerships',
      borderRadius: {
        topLeft: 4,
        topRight: 4
      },
      borderSkipped: false,
      order: 9
    }
  ]
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
      mode: 'index',
      intersect: false,
      reverse: true
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
  barPercentage: 0.7,
  categoryPercentage: 0.8
};
</script>