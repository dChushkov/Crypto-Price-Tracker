<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import type { CryptoData } from '../types/crypto';
import CryptoCard from './CryptoCard.vue';
import { BINANCE_API_URL, API_CONFIG, CRYPTO_INFO } from '../config';

const cryptoList = ref<CryptoData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const retryTimeout = ref<number | null>(null);
const retryCount = ref(0);
const lastUpdateTime = ref<Date | null>(null);
const fullscreenCrypto = ref<CryptoData | null>(null);
const sortBy = ref<'market_cap' | 'price_change' | 'name' | 'price'>('market_cap');
const sortDirection = ref<'asc' | 'desc'>('desc');

// Computed total market cap
const totalMarketCap = computed(() => {
  return cryptoList.value.reduce((total, crypto) => total + (crypto.market_cap || 0), 0);
});

// Computed top gainers and losers
const topGainers = computed(() => {
  return [...cryptoList.value]
    .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
    .slice(0, 3);
});

const topLosers = computed(() => {
  return [...cryptoList.value]
    .sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
    .slice(0, 3);
});

// Sorted and filtered list
const sortedCryptoList = computed(() => {
  return [...cryptoList.value].sort((a, b) => {
    let comparison = 0;
    switch (sortBy.value) {
      case 'market_cap':
        comparison = (b.market_cap || 0) - (a.market_cap || 0);
        break;
      case 'price_change':
        comparison = (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = (b.current_price || 0) - (a.current_price || 0);
        break;
    }
    return sortDirection.value === 'desc' ? comparison : -comparison;
  });
});

const formatLastUpdate = () => {
  if (!lastUpdateTime.value) return '';
  return new Intl.DateTimeFormat('default', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(lastUpdateTime.value);
};

const formatTotalMarketCap = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value);
};

const toggleSort = (newSortBy: typeof sortBy.value) => {
  if (sortBy.value === newSortBy) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = newSortBy;
    sortDirection.value = 'desc';
  }
};

const transformBinanceData = async (): Promise<CryptoData[]> => {
  try {
    const symbols = Object.keys(CRYPTO_INFO).map(symbol => `${symbol}USDT`);
    
    // Get 24hr ticker data which includes price changes
    const tickerResponse = await axios.get(`${BINANCE_API_URL}/ticker/24hr`, {
      params: {
        symbols: JSON.stringify(symbols)
      }
    });

    // Get current prices
    const priceResponse = await axios.get(`${BINANCE_API_URL}/ticker/price`, {
      params: {
        symbols: JSON.stringify(symbols)
      }
    });

    // Create a map of current prices
    const priceMap = new Map(
      priceResponse.data.map((item: any) => [
        item.symbol,
        parseFloat(item.price)
      ])
    );

    return tickerResponse.data
      .filter((item: any) => {
        const baseSymbol = item.symbol.replace('USDT', '');
        return CRYPTO_INFO[baseSymbol];
      })
      .map((item: any) => {
        const baseSymbol = item.symbol.replace('USDT', '');
        const info = CRYPTO_INFO[baseSymbol];
        
        // Get current price from price endpoint
        const currentPrice = priceMap.get(item.symbol) || parseFloat(item.lastPrice);
        
        // Calculate market cap using circulating supply
        const marketCap = currentPrice * info.circulatingSupply;
        
        const priceChange = parseFloat(item.priceChangePercent);

        return {
          id: baseSymbol.toLowerCase(),
          symbol: baseSymbol.toLowerCase(),
          name: info.name,
          image: info.image,
          current_price: currentPrice,
          price_change_percentage_24h: priceChange,
          market_cap: marketCap,
          market_cap_rank: 0
        };
      })
      .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
      .map((item, index) => ({
        ...item,
        market_cap_rank: index + 1
      }));
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
};

const fetchCryptoData = async (isRetry = false) => {
  try {
    if (!isRetry) {
      loading.value = true;
    }
    error.value = null;
    
    cryptoList.value = await transformBinanceData();
    lastUpdateTime.value = new Date();
    retryCount.value = 0;
    loading.value = false;
  } catch (e) {
    console.error('API Error:', e);
    if (axios.isAxiosError(e)) {
      if (!e.response) {
        if (retryCount.value < API_CONFIG.MAX_RETRIES) {
          error.value = `Unable to fetch data. Retrying in ${API_CONFIG.RETRY_DELAY/1000} seconds...`;
          scheduleRetry(API_CONFIG.RETRY_DELAY);
        } else {
          error.value = 'Unable to connect to the server. Please try again later.';
        }
      } else {
        error.value = 'An error occurred while fetching data. Please try again.';
      }
    } else {
      error.value = 'An unexpected error occurred. Please try again.';
    }
    if (!isRetry) {
      loading.value = false;
    }
  }
};

const scheduleRetry = (delay: number) => {
  if (retryTimeout.value) {
    clearTimeout(retryTimeout.value);
  }
  if (interval) {
    clearInterval(interval);
  }
  
  retryCount.value++;
  retryTimeout.value = setTimeout(() => {
    fetchCryptoData(true);
    if (!error.value) {
      startInterval();
    }
  }, delay);
};

const startInterval = () => {
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(fetchCryptoData, API_CONFIG.REFRESH_INTERVAL);
};

let interval: number;

const startFetching = () => {
  retryCount.value = 0;
  if (retryTimeout.value) {
    clearTimeout(retryTimeout.value);
  }
  if (interval) {
    clearInterval(interval);
  }
  fetchCryptoData();
  startInterval();
};

const handleFullscreen = (crypto: CryptoData | null) => {
  if (fullscreenCrypto.value?.id === crypto?.id) {
    fullscreenCrypto.value = null;
  } else {
    fullscreenCrypto.value = crypto;
  }
  document.body.style.overflow = crypto ? 'hidden' : '';
};

onMounted(() => {
  startFetching();
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
  if (retryTimeout.value) clearTimeout(retryTimeout.value);
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-4">
        Crypto Price Tracker
      </h1>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Track real-time cryptocurrency prices, market caps, and trends with our advanced crypto tracker
      </p>
    </div>

    <!-- Market Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-xl shadow-lg p-8">
        <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Total Market Cap</h3>
        <p class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          {{ formatTotalMarketCap(totalMarketCap) }}
        </p>
      </div>
      
      <div class="bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 rounded-xl shadow-lg p-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Gainers (24h)</h3>
        <ul class="space-y-3">
          <li v-for="crypto in topGainers" :key="crypto.id" class="flex justify-between items-center">
            <div class="flex items-center">
              <img :src="crypto.image" :alt="crypto.name" class="w-6 h-6 mr-2">
              <span class="text-gray-600 dark:text-gray-400">{{ crypto.name }}</span>
            </div>
            <span class="text-green-600 dark:text-green-400 font-semibold">
              +{{ crypto.price_change_percentage_24h?.toFixed(2) }}%
            </span>
          </li>
        </ul>
      </div>
      
      <div class="bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/5 dark:to-orange-500/5 rounded-xl shadow-lg p-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Losers (24h)</h3>
        <ul class="space-y-3">
          <li v-for="crypto in topLosers" :key="crypto.id" class="flex justify-between items-center">
            <div class="flex items-center">
              <img :src="crypto.image" :alt="crypto.name" class="w-6 h-6 mr-2">
              <span class="text-gray-600 dark:text-gray-400">{{ crypto.name }}</span>
            </div>
            <span class="text-red-600 dark:text-red-400 font-semibold">
              {{ crypto.price_change_percentage_24h?.toFixed(2) }}%
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Controls Bar -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="text-sm text-gray-600 dark:text-gray-400" v-if="lastUpdateTime">
        Last updated: {{ formatLastUpdate() }}
      </div>
      
      <!-- Sort Controls -->
      <div class="flex gap-2">
        <button
          v-for="option in [
            { value: 'market_cap', label: 'Market Cap' },
            { value: 'price_change', label: 'Price Change' },
            { value: 'name', label: 'Name' },
            { value: 'price', label: 'Price' }
          ]"
          :key="option.value"
          @click="toggleSort(option.value)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            sortBy === option.value
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ option.label }}
          <span v-if="sortBy === option.value">
            {{ sortDirection === 'desc' ? '↓' : '↑' }}
          </span>
        </button>
      </div>
    </div>
    
    <!-- Loading and Error States -->
    <div v-if="loading && !error" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
    </div>
    
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center mb-8">
      <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
      <button
        v-if="!retryTimeout"
        @click="startFetching"
        class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
      >
        Retry Now
      </button>
    </div>
    
    <!-- Fullscreen Modal -->
    <div v-if="fullscreenCrypto" class="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm">
      <div class="container mx-auto p-4 h-full">
        <CryptoCard
          :crypto="fullscreenCrypto"
          :is-fullscreen="true"
          @fullscreen="handleFullscreen"
        />
      </div>
    </div>
    
    <!-- Crypto Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CryptoCard
        v-for="crypto in sortedCryptoList"
        :key="crypto.id"
        :crypto="crypto"
        :is-fullscreen="false"
        @fullscreen="handleFullscreen"
      />
    </div>
  </div>
</template>