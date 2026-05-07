<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Click to expand'
  },
  icon: {
    type: String,
    default: 'info' // info, warning, idea
  }
})

const isOpen = ref(false)
</script>

<template>
  <div class="my-6 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
    <!-- Header (Always Visible) -->
    <button 
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
    >
      <div class="flex items-center gap-3">
        <!-- Icon based on type -->
        <div class="bg-blue-100 p-1.5 rounded-lg text-blue-600">
          <svg v-if="icon === 'info'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <span class="font-bold text-gray-800 tracking-tight">{{ title }}</span>
      </div>
      
      <!-- Plus/Minus Icon -->
      <div class="text-gray-400 group-hover:text-gray-600 transition-transform duration-300" :class="isOpen ? 'rotate-180' : ''">
        <svg v-if="!isOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" />
        </svg>
      </div>
    </button>

    <!-- Content (Expandable) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[1000px] opacity-100"
      leave-from-class="max-h-[1000px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="isOpen" class="overflow-hidden border-t border-gray-100">
        <div class="p-6 bg-blue-50/30 prose prose-sm max-w-none">
          <ContentSlot :use="$slots.default" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Ensure smooth transition for content height */
.max-h-0 { max-height: 0; }
.max-h-\[1000px\] { max-height: 1000px; }
</style>
