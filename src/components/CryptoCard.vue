<script setup lang="ts">
import { ref } from 'vue';
import type { CryptoData } from '../types/crypto';
import PriceChart from './PriceChart.vue';

const props = defineProps<{
  crypto: CryptoData;
}>();

const formatPrice = (price: number) => {
  if (typeof price !== 'number' || isNaN(price)) return '$0.00';
  
  // Use different fraction digits based on price magnitude
  let fractionDigits;
  if (price < 0.0001) {
    fractionDigits = 10;
  } else if (price < 0.01) {
    fractionDigits = 8;
  } else if (price < 1) {
    fractionDigits = 6;
  } else if (price < 100) {
    fractionDigits = 4;
  } else {
    fractionDigits = 2;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(price);
};

const formatMarketCap = (marketCap: number) => {
  if (typeof marketCap !== 'number' || isNaN(marketCap)) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(marketCap);
};

const formatPriceChange = (change: number | undefined): string => {
  if (typeof change !== 'number' || isNaN(change)) {
    return '0.00';
  }
  return change.toFixed(2);
};

const emit = defineEmits(['fullscreen']);

const handleFullscreenClick = () => {
  emit('fullscreen', props.crypto);
};
</script>

<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    :class="{ 'fixed inset-0 z-50': $attrs.isFullscreen }"
  >
    <!-- Card Header -->
    <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <img 
              :src="crypto.image" 
              :alt="crypto.name" 
              class="w-12 h-12 rounded-full shadow-lg"
            >
            <div class="absolute -bottom-1 -right-1 bg-blue-500 text-white dark:bg-blue-600 rounded-full px-2 py-0.5 text-xs font-semibold shadow-lg">
              #{{ crypto.market_cap_rank }}
            </div>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ crypto.name }}</h2>
            <p class="text-gray-500 dark:text-gray-400 uppercase text-sm font-medium">{{ crypto.symbol }}</p>
          </div>
        </div>
        <button
          @click="handleFullscreenClick"
          class="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/5 dark:hover:bg-blue-500/10 transition-colors"
        >
          <span class="text-blue-600 dark:text-blue-400">{{ $attrs.isFullscreen ? '🔄' : '📈' }}</span>
        </button>
      </div>
    </div>
    
    <!-- Price Information -->
    <div class="p-6 space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-gray-600 dark:text-gray-400 font-medium">Price</span>
        <div class="text-right">
          <span class="text-xl font-bold text-gray-900 dark:text-white">
            {{ formatPrice(crypto.current_price) }}
          </span>
          <div 
            :class="[
              'text-sm font-semibold ml-2 inline-block px-2 py-0.5 rounded',
              (crypto.price_change_percentage_24h || 0) >= 0 
                ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
            ]"
          >
            {{ (crypto.price_change_percentage_24h || 0) >= 0 ? '+' : '' }}{{ formatPriceChange(crypto.price_change_percentage_24h) }}%
          </div>
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <span class="text-gray-600 dark:text-gray-400 font-medium">Market Cap</span>
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ formatMarketCap(crypto.market_cap) }}
        </span>
      </div>

      <!-- Chart -->
      <div 
        :class="{ 
          'h-48': !$attrs.isFullscreen, 
          'h-[calc(100vh-300px)]': $attrs.isFullscreen 
        }" 
        class="mt-4"
      >
        <PriceChart :crypto-id="crypto.id" :is-fullscreen="$attrs.isFullscreen" />
      </div>
    </div>
  </div>
</template>