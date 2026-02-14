<template>
  <div class="relative">
    <select v-model="$i18n.locale" class="bg-black/50 border border-white/10 rounded-lg text-xs py-1 px-2 text-gray-300 focus:outline-none focus:border-primary appearance-none pr-8 cursor-pointer hover:bg-white/5 transition-colors">
      <option value="en">English</option>
      <option value="ru">Русский</option>
      <option value="kk">Қазақша</option>
    </select>
    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
</template>

<script setup>
// Uses global $i18n instance automatically
</script>
