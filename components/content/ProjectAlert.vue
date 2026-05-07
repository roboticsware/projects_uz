<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'info' // info, warning, success
  }
})

const { t } = useI18n()
const isOpen = ref(true) // Open by default

const config = computed(() => ({
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    title: t('alert.info')
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    title: t('alert.warning')
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-600',
    title: t('alert.success')
  }
}))

const style = computed(() => config.value[props.type] || config.value.info)
</script>

<template>
  <div :class="['my-6 rounded-xl border-l-4 shadow-sm transition-all duration-300', style.bg, style.border, isOpen ? 'p-5' : 'p-3 px-5']">
    <div class="flex items-start cursor-pointer group" @click="isOpen = !isOpen">
      <div :class="['flex-shrink-0 mr-4 mt-0.5', style.iconColor]">
        <!-- Info Icon -->
        <svg v-if="type === 'info'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <!-- Warning Icon -->
        <svg v-else-if="type === 'warning'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <!-- Success/Tip Icon -->
        <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div class="flex-grow">
        <div class="flex items-center justify-between">
          <h4 :class="['font-extrabold text-sm uppercase tracking-wider', style.iconColor]">
            <ContentSlot :use="$slots.title" unwrap="p">{{ style.title }}</ContentSlot>
          </h4>
          <svg 
            class="w-4 h-4 transition-transform duration-300 text-gray-400 group-hover:text-gray-600"
            :class="{ 'rotate-180': isOpen }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        <transition name="expand">
          <div v-show="isOpen" class="mt-2 text-gray-700 leading-relaxed overflow-hidden">
            <ContentSlot :use="$slots.default" />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 500px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
