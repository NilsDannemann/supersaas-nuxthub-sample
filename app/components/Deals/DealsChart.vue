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

// Mock data for deals per month
const mockData = {
  'Jan': { won: 12, lost: 5, open: 8 },
  'Feb': { won: 15, lost: 7, open: 10 },
  'Mar': { won: 18, lost: 4, open: 12 },
  'Apr': { won: 14, lost: 6, open: 9 },
  'May': { won: 20, lost: 8, open: 15 },
  'Jun': { won: 22, lost: 5, open: 11 },
  'Jul': { won: 17, lost: 9, open: 13 },
  'Aug': { won: 25, lost: 7, open: 16 },
  'Sep': { won: 19, lost: 6, open: 14 },
  'Oct': { won: 21, lost: 8, open: 12 },
  'Nov': { won: 16, lost: 5, open: 10 },
  'Dec': { won: 23, lost: 7, open: 15 }
};

const chartData = {
  labels: Object.keys(mockData),
  datasets: [
    {
      label: 'Open',
      data: Object.values(mockData).map(d => d.open),
      backgroundColor: '#94A3B8', // gray-400
      stack: 'Stack 0',
      borderSkipped: false
    },
    {
      label: 'Lost',
      data: Object.values(mockData).map(d => d.lost),
      backgroundColor: '#64748B', // gray-500
      stack: 'Stack 0',
      borderSkipped: false
    },
    {
      label: 'Won',
      data: Object.values(mockData).map(d => d.won),
      backgroundColor: '#0EA5E9', // sky-500 (primary color)
      stack: 'Stack 0',
      borderRadius: {
        topLeft: 4,
        topRight: 4
      },
      borderSkipped: false
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
      intersect: false
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
  barPercentage: 0.6,
  categoryPercentage: 0.8
};
</script>