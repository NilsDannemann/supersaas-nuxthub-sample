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
      label: 'Won',
      data: Object.values(mockData).map(d => d.won),
      backgroundColor: 'rgb(34, 197, 94)', // green-500
      stack: 'Stack 0',
    },
    {
      label: 'Lost',
      data: Object.values(mockData).map(d => d.lost),
      backgroundColor: 'rgb(239, 68, 68)', // red-500
      stack: 'Stack 0',
    },
    {
      label: 'Open',
      data: Object.values(mockData).map(d => d.open),
      backgroundColor: 'rgb(59, 130, 246)', // blue-500
      stack: 'Stack 0',
    }
  ]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
      }
    },
    title: {
      display: true,
      text: 'Deals by Month'
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
  }
};
</script>