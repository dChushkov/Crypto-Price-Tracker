<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { format } from 'date-fns';
import axios from 'axios';
import { BINANCE_API_URL, API_CONFIG } from '../config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps<{
  cryptoId: string;
  isFullscreen?: boolean;
}>();

const chartData = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const retryTimeout = ref<number | null>(null);
const retryCount = ref(0);
const lastUpdateTime = ref<Date | null>(null);
const selectedInterval = ref<string>('1h');

const intervals = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '1d' },
  { label: '7D', value: '1w' },
  { label: '30D', value: '1M' }
];

const formatPrice = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '$0.00';
  
  let precision;
  if (value < 0.0001) {
    precision = 10;
  } else if (value < 0.01) {
    precision = 8;
  } else if (value < 1) {
    precision = 6;
  } else if (value < 100) {
    precision = 4;
  } else {
    precision = 2;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value);
};

const options = computed<ChartOptions>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  scales: {
    y: {
      ticks: {
        callback: (value) => {
          if (typeof value === 'number') {
            return formatPrice(value);
          }
          return value;
        },
        color: 'rgb(156, 163, 175)'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    },
    x: {
      ticks: {
        color: 'rgb(156, 163, 175)',
        maxRotation: 0
      },
      grid: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      titleColor: 'rgb(243, 244, 246)',
      bodyColor: 'rgb(243, 244, 246)',
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context) => {
          if (typeof context.parsed.y === 'number') {
            return `Price: ${formatPrice(context.parsed.y)}`;
          }
          return '';
        }
      }
    }
  }
}));

const formatLastUpdate = () => {
  if (!lastUpdateTime.value) return '';
  return new Intl.DateTimeFormat('default', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(lastUpdateTime.value);
};

const getKlineInterval = (interval: string) => {
  switch (interval) {
    case '1h': return '1m';
    case '1d': return '5m';
    case '1w': return '1h';
    case '1M': return '4h';
    default: return '1m';
  }
};

const getKlineLimit = (interval: string) => {
  switch (interval) {
    case '1h': return 60;
    case '1d': return 288;
    case '1w': return 168;
    case '1M': return 180;
    default: return 60;
  }
};

const fetchChartData = async (isRetry = false) => {
  try {
    if (!isRetry) {
      loading.value = true;
      chartData.value = null;
    }
    error.value = null;
    
    const klineInterval = getKlineInterval(selectedInterval.value);
    const limit = getKlineLimit(selectedInterval.value);
    
    const response = await axios.get(
      `${BINANCE_API_URL}/klines`,
      {
        params: {
          symbol: `${props.cryptoId.toUpperCase()}USDT`,
          interval: klineInterval,
          limit: limit
        },
        timeout: API_CONFIG.TIMEOUT
      }
    );

    if (response.data && response.data.length > 0) {
      const prices = response.data.map((candle: any[]) => ({
        timestamp: candle[0],
        price: parseFloat(candle[4])
      }));

      chartData.value = {
        labels: prices.map(price => {
          const date = new Date(price.timestamp);
          switch (selectedInterval.value) {
            case '1h':
              return format(date, 'HH:mm');
            case '1d':
              return format(date, 'HH:mm');
            case '1w':
              return format(date, 'EEE HH:mm');
            case '1M':
              return format(date, 'MMM dd');
            default:
              return format(date, 'HH:mm');
          }
        }),
        datasets: [
          {
            label: 'Price',
            data: prices.map(price => price.price),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true
          }
        ]
      };
      lastUpdateTime.value = new Date();
      retryCount.value = 0;
    } else {
      throw new Error('No price data available');
    }
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (!e.response) {
        if (retryCount.value < API_CONFIG.MAX_RETRIES) {
          const delay = API_CONFIG.RETRY_DELAY;
          error.value = `Network error. Retrying in ${delay/1000} seconds... (Attempt ${retryCount.value + 1}/${API_CONFIG.MAX_RETRIES})`;
          scheduleRetry(delay);
        } else {
          error.value = 'Network error. Maximum retry attempts reached.';
        }
      } else {
        error.value = 'Failed to load chart data';
      }
    } else {
      error.value = 'An unexpected error occurred. Please try again.';
    }
  } finally {
    if (!isRetry) {
      loading.value = false;
    }
  }
};

const scheduleRetry = (delay: number) => {
  if (retryTimeout.value) {
    clearTimeout(retryTimeout.value);
  }
  
  retryCount.value++;
  retryTimeout.value = setTimeout(() => {
    fetchChartData(true);
  }, delay);
};

watch(() => props.cryptoId, (newId) => {
  retryCount.value = 0;
  if (retryTimeout.value) {
    clearTimeout(retryTimeout.value);
    retryTimeout.value = null;
  }
  fetchChartData();
}, { immediate: true });

watch(() => selectedInterval.value, () => {
  fetchChartData();
});

onMounted(() => {
  fetchChartData();
});
</script>

<template>
  <div class="h-full relative">
    <div class="flex justify-between items-center mb-4">
      <div v-if="lastUpdateTime" class="text-xs text-gray-500 dark:text-gray-400">
        Last updated: {{ formatLastUpdate() }}
      </div>
      <div class="flex gap-2">
        <button
          v-for="interval in intervals"
          :key="interval.value"
          @click="selectedInterval = interval.value"
          :class="[
            'px-3 py-1 rounded text-sm transition-colors',
            selectedInterval === interval.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ interval.label }}
        </button>
      </div>
    </div>
    
    <div v-if="loading && !chartData" class="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
      <div class="text-center">
        <p class="text-red-500 mb-2">{{ error }}</p>
        <button
          v-if="!retryTimeout"
          @click="fetchChartData"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry Now
        </button>
      </div>
    </div>
    
    <Line
      v-if="chartData"
      :data="chartData"
      :options="options"
      class="h-full"
    />
  </div>
</template>