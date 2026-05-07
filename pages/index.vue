<script setup>
const localePath = useLocalePath()
</script>

<template>
  <div class="relative overflow-hidden bg-white">
    <!-- Hero Background Elements -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-1/2 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
      <div class="text-center">
        <h1 class="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight mb-8">
          {{ $t('home.heroTitle') }}
        </h1>
        <p class="max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed">
          {{ $t('home.heroSubtitle') }}
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <NuxtLink 
            :to="localePath('/projects')" 
            class="inline-flex items-center justify-center px-10 py-5 rounded-full bg-blue-600 text-white font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
          >
            {{ $t('home.cta') }}
            <svg class="ml-2 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Featured Icons -->
        <div class="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           <div class="flex flex-col items-center">
             <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">💻</div>
             <span class="text-xs font-bold uppercase tracking-widest">Coding</span>
           </div>
           <div class="flex flex-col items-center">
             <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">🤖</div>
             <span class="text-xs font-bold uppercase tracking-widest">Robotics</span>
           </div>
           <div class="flex flex-col items-center">
             <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">🔌</div>
             <span class="text-xs font-bold uppercase tracking-widest">Electronics</span>
           </div>
           <div class="flex flex-col items-center">
             <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">🚀</div>
             <span class="text-xs font-bold uppercase tracking-widest">Future</span>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
