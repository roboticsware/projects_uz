<script setup>
const checked = ref(false)
</script>

<template>
  <div 
    @click="checked = !checked"
    :class="['my-4 p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center group', 
             checked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200']"
  >
    <div 
      :class="['w-6 h-6 rounded border-2 flex items-center justify-center mr-4 transition-colors',
               checked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300 group-hover:border-gray-400']"
    >
      <svg v-if="checked" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div :class="['flex-1 font-medium select-none', checked ? 'text-green-800 line-through opacity-70' : 'text-gray-700']">
      <ContentSlot :use="$slots.default" unwrap="p" />
    </div>
  </div>
</template>
