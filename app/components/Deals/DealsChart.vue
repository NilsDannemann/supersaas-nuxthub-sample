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

// Mock data with three years and more consistent numbers
const mockData = {
  'Jan': { 
    current: { won: 10, lost: 4, open: 6 },
    previous: { won: 9, lost: 4, open: 5 },
    year3: { won: 8, lost: 3, open: 5 }
  },
  'Feb': { 
    current: { won: 11, lost: 5, open: 7 },
    previous: { won: 10, lost: 4, open: 6 },
    year3: { won: 9, lost: 4, open: 6 }
  },
  'Mar': { 
    current: { won: 12, lost: 4, open: 8 },
    previous: { won: 11, lost: 4, open: 7 },
    year3: { won: 10, lost: 3, open: 6 }
  },
  'Apr': { 
    current: { won: 11, lost: 5, open: 7 },
    previous: { won: 10, lost: 4, open: 6 },
    year3: { won: 9, lost: 4, open: 5 }
  },
  'May': { 
    current: { won: 13, lost: 5, open: 8 },
    previous: { won: 12, lost: 4, open: 7 },
    year3: { won: 11, lost: 4, open: 6 }
  },
  'Jun': { 
    current: { won: 12, lost: 4, open: 7 },
    previous: { won: 11, lost: 4, open: 6 },
    year3: { won: 10, lost: 3, open: 5 }
  }
};

const chartData = {
  labels: Object.keys(mockData),
  datasets: [
    // Current Year
    {
      label: 'Won (2024)',
      data: Object.values(mockData).map(d => d.current.won),
      backgroundColor: '#0EA5E9', // sky-500
      stack: 'Stack 1',
      borderSkipped: false,
      order: 1
    },
    {
      label: 'Lost (2024)',
      data: Object.values(mockData).map(d => d.current.lost),
      backgroundColor: '#38BDF8', // sky-400
      stack: 'Stack 1',
      borderSkipped: false,
      order: 2
    },
    {
      label: 'Open (2024)',
      data: Object.values(mockData).map(d => d.current.open),
      backgroundColor: '#BAE6FD', // sky-200
      stack: 'Stack 1',
      borderRadius: {
        topLeft: 4,
        topRight: 4
      },
      borderSkipped: false,
      order: 3
    },
    // Previous Year
    {
      label: 'Won (2023)',
      data: Object.values(mockData).map(d => d.previous.won),
      backgroundColor: '#0EA5E9', // sky-500
      stack: 'Stack 2',
      borderSkipped: false,
      order: 4
    },
    {
      label: 'Lost (2023)',
      data: Object.values(mockData).map(d => d.previous.lost),
      backgroundColor: '#38BDF8', // sky-400
      stack: 'Stack 2',
      borderSkipped: false,
      order: 5
    },
    {
      label: 'Open (2023)',
      data: Object.values(mockData).map(d => d.previous.open),
      backgroundColor: '#BAE6FD', // sky-200
      stack: 'Stack 2',
      borderRadius: {
        topLeft: 4,
        topRight: 4
      },
      borderSkipped: false,
      order: 6
    },
    // Year 3
    {
      label: 'Won (2022)',
      data: Object.values(mockData).map(d => d.year3.won),
      backgroundColor: '#0EA5E9', // sky-500
      stack: 'Stack 3',
      borderSkipped: false,
      order: 7
    },
    {
      label: 'Lost (2022)',
      data: Object.values(mockData).map(d => d.year3.lost),
      backgroundColor: '#38BDF8', // sky-400
      stack: 'Stack 3',
      borderSkipped: false,
      order: 8
    },
    {
      label: 'Open (2022)',
      data: Object.values(mockData).map(d => d.year3.open),
      backgroundColor: '#BAE6FD', // sky-200
      stack: 'Stack 3',
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
  barPercentage: 0.7, // Made slightly thinner to accommodate three bars
  categoryPercentage: 0.8, // Keeps good spacing between month groups
};
</script>