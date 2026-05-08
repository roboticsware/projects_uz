<script setup>
import { ref, computed } from 'vue'

const { locale, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// 1. Fetch all projects using Nuxt Content (Locale Filtered)
const { data: allProjects } = await useAsyncData(`projects-${locale.value}`, () => 
  queryContent(locale.value, 'projects').find()
)

// 2. Define Filter Configuration (Localized via i18n.config.ts)
const { tm } = useI18n()
const filterConfig = computed(() => [
  {
    id: 'difficulty',
    label: t('list.difficulty'),
    options: tm('list.levels') // tm을 사용하여 배열을 안전하게 가져옵니다.
  },
  {
    id: 'technology',
    label: t('list.technology'),
    options: tm('list.techOptions')
  },
  {
    id: 'hardware',
    label: t('list.hardware'),
    options: tm('list.hardwareOptions')
  }
])

// 3. Reactive State for Search and Filters
const searchQuery = ref('')
const selectedFilters = ref({
  difficulty: [],
  technology: [],
  hardware: []
})

// Reset filters when locale changes
watch(locale, () => {
  selectedFilters.value = { difficulty: [], technology: [], hardware: [] }
  refreshNuxtData(`projects-${locale.value}`)
})

// 4. Computed property that dynamically filters the projects
const filteredProjects = computed(() => {
  if (!allProjects.value) return []
  
  return allProjects.value.filter(project => {
    const matchesSearch = searchQuery.value === '' || 
      (project.title && project.title.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
      
    if (!matchesSearch) return false

    for (const category of filterConfig.value) {
      const selectedOptions = selectedFilters.value[category.id]
      if (selectedOptions && selectedOptions.length > 0) {
        const projectValue = project[category.id]
        if (!projectValue) return false 
        
        let matchesCategory = false
        if (Array.isArray(projectValue)) {
          matchesCategory = selectedOptions.some(opt => projectValue.includes(opt))
        } else {
          matchesCategory = selectedOptions.includes(projectValue)
        }
        if (!matchesCategory) return false
      }
    }
    return true
  })
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <div class="mb-8">
      <h1 class="text-4xl font-extrabold text-gray-900">{{ $t('list.title') }}</h1>
      <p class="text-gray-500 mt-2">{{ $t('list.subtitle') }}</p>
    </div>

    <div class="flex flex-col md:flex-row gap-8">
      
      <!-- SIDEBAR FILTERS -->
      <aside class="w-full md:w-64 flex-shrink-0">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-2">{{ $t('list.filter') }}</h2>
            <p class="text-xs text-gray-500 leading-snug">{{ $t('list.filterDesc') }}</p>
          </div>
          
          <div v-for="(category, index) in filterConfig" :key="category.id" class="mb-6">
            <h3 class="font-bold text-gray-900 mb-3">{{ category.label }}</h3>
            <div class="space-y-3">
              <label v-for="option in category.options" :key="option" class="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  :value="option" 
                  v-model="selectedFilters[category.id]"
                  class="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                >
                <span class="text-gray-700 text-sm group-hover:text-black">{{ option }}</span>
              </label>
            </div>
            <hr class="mt-6 border-gray-100" v-if="index !== filterConfig.length - 1">
          </div>
        </div>
      </aside>
      
      <!-- MAIN CONTENT -->
      <main class="flex-1">
        <!-- Search Bar & Results Count -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <p class="text-gray-800 font-semibold">
            {{ filteredProjects.length }} {{ $t('list.results') }}
          </p>
          <div class="relative w-full sm:w-80">
            <input 
              type="text" 
              v-model="searchQuery"
              :placeholder="$t('list.searchPlaceholder')" 
              class="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
            >
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Project Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="project in filteredProjects" :key="project._path" class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer group" @click="$router.push(project._path)">
            <div class="h-44 flex items-center justify-center p-4 text-center transition-transform duration-500 group-hover:scale-105"
                 :class="project.technology && project.technology.includes('Scratch') ? 'bg-gradient-to-br from-green-300 to-blue-200' : 'bg-gradient-to-br from-purple-300 to-pink-200'">
               <span class="text-white font-bold opacity-80 text-xl tracking-wide">{{ project.technology && project.technology[0] }}</span>
            </div>
            
            <div class="p-5 flex flex-col flex-grow bg-white z-10">
              <div class="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-bold tracking-wide uppercase text-gray-500">
                <span v-if="project.difficulty">{{ project.difficulty }}</span>
                <span v-if="project.difficulty && project.technology" class="text-gray-300">•</span>
                <span v-if="project.technology && project.technology.length">{{ project.technology[0] }}</span>
              </div>
              <h2 class="text-xl font-extrabold text-gray-900 mb-2 leading-tight group-hover:text-green-600 transition-colors">{{ project.title }}</h2>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">{{ project.description }}</p>
              
              <!-- Author Info in Card Footer -->
              <div class="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] border border-gray-200">
                  <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">{{ project.author || 'Roboticsware' }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  </div>
</template>
