<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CryptoList from './components/CryptoList.vue';

const isDarkMode = ref(false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDarkMode.value.toString());
};

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  isDarkMode.value = savedDarkMode;
  if (savedDarkMode) {
    document.documentElement.classList.add('dark');
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <nav class="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Crypto Tracker</h1>
        <button
          @click="toggleDarkMode"
          class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle dark mode"
        >
          <span v-if="isDarkMode" class="text-yellow-500">🌞</span>
          <span v-else class="text-gray-700">🌙</span>
        </button>
      </div>
    </nav>
    
    <CryptoList />
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --scrollbar-thumb: #cbd5e1;
  --scrollbar-track: #f1f5f9;
}

.dark {
  --scrollbar-thumb: #475569;
  --scrollbar-track: #1f2937;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb);
}
</style>