<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'search', value: string): void
}>();

const searchTerm = ref('');

const handleSearch = (value: string) => {
  emit('search', value);
};
</script>

<template>
  <div class="mb-6">
    <div class="relative">
      <input
        v-model="searchTerm"
        v-debounce:300="handleSearch"
        type="text"
        placeholder="Search cryptocurrencies..."
        class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  </div>
</template>