<script setup>
const { locale, t } = useI18n()
const { path } = useRoute()
const localePath = useLocalePath()
const { loggedIn, user } = useUserSession()

const { data: badges, refresh: refreshBadges } = await useFetch('/api/user/badges', {
  lazy: true,
  server: false
})

// 1. Fetch project data
const { data: project } = await useAsyncData(`project-${path}`, () => queryContent(path).findOne())

// 2. Split markdown into steps based on <h2>
const steps = computed(() => {
  if (!project.value || !project.value.body || !project.value.body.children) return []
  
  const result = []
  let currentStep = { id: 'intro', title: 'Introduction', children: [] }
  
  project.value.body.children.forEach((node, index) => {
    if (node.tag === 'h2') {
      if (currentStep.children.length > 0 || result.length > 0) result.push(currentStep)
      let title = node.children?.[0]?.value || 'Step'
      currentStep = { id: `step-${index}`, title: title, children: [node] }
    } else {
      currentStep.children.push(node)
    }
  })
  if (currentStep.children.length > 0 || result.length === 0) result.push(currentStep)
  return result
})

const currentStepIndex = ref(0)
const currentStepContent = computed(() => {
  if (!project.value || steps.value.length === 0) return null
  return { ...project.value, body: { ...project.value.body, children: steps.value[currentStepIndex.value].children } }
})

const nextStep = () => {
  if (currentStepIndex.value < steps.value.length - 1) {
    currentStepIndex.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const themeColor = computed(() => {
  const tech = project.value?.technology?.[0]?.toLowerCase() || ''
  if (tech.includes('scratch') || tech.includes('entry')) return 'bg-green-500'
  if (tech.includes('python')) return 'bg-blue-500'
  return 'bg-cyan-500'
})

const isHardwareProject = computed(() => {
  const tech = project.value?.technology?.[0]?.toLowerCase() || ''
  return tech.includes('robot') || tech.includes('physical') || tech.includes('로봇')
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20" v-if="project">
    <!-- HERO BANNER -->
    <div :class="['w-full pt-6 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500', themeColor]">
      <div class="max-w-7xl mx-auto">
        <NuxtLink :to="localePath('/projects')" class="text-white/80 hover:text-white font-bold mb-6 inline-flex items-center transition-colors text-sm">
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {{ $t('detail.back') }}
        </NuxtLink>

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-white">
          <div class="flex-1">
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="bg-black/20 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-widest">{{ project.difficulty }}</span>
              <span class="bg-black/20 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-widest">{{ project.technology?.[0] }}</span>
              <!-- Hardware Sub-category Badge -->
              <template v-if="isHardwareProject && project.hardware?.length">
                <span v-for="hw in project.hardware" :key="hw" class="bg-orange-500/80 text-white text-[10px] font-black px-2 py-1 rounded border border-orange-300/50 uppercase tracking-widest flex items-center gap-1 shadow-sm">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                  {{ hw }}
                </span>
              </template>
            </div>
            <h1 class="text-4xl sm:text-5xl font-black mb-4 tracking-tight">{{ project.title }}</h1>
            <div class="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 inline-flex flex-col">
              <p class="text-white/80 text-[10px] font-bold uppercase mb-2">{{ $t('detail.yourProgress') }}</p>
              <div class="flex gap-2">
                <div v-for="(s, i) in steps" :key="i" class="w-4 h-4 rounded-full border-2 transition-all" :class="i <= currentStepIndex ? 'bg-white border-white scale-110 shadow-lg' : 'bg-transparent border-white/40'"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN INTERFACE -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- SIDEBAR -->
        <aside class="w-full lg:w-72 flex-shrink-0">
          <div class="sticky top-8 space-y-6">
            <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 class="text-gray-900 font-black text-xs uppercase tracking-widest mb-6">{{ $t('detail.projectSteps') }}</h3>
              <nav class="relative pl-2">
                <div class="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gray-100"></div>
                <ul class="space-y-4 relative z-10">
                  <li v-for="(step, index) in steps" :key="step.id">
                    <button @click="currentStepIndex = index" class="flex items-center w-full group text-left">
                      <div class="w-7 h-7 rounded-full flex items-center justify-center transition-all ring-4 ring-white" :class="currentStepIndex === index ? 'bg-green-600 text-white scale-110 shadow-lg' : index < currentStepIndex ? 'bg-green-400 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'">
                        <svg v-if="index < currentStepIndex" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                        <span v-else class="text-[10px] font-black">{{ index + 1 }}</span>
                      </div>
                      <span class="ml-4 text-sm font-bold transition-colors" :class="currentStepIndex === index ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'">{{ step.title }}</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            <div class="space-y-3">
              <button class="w-full bg-white border-2 border-gray-200 py-3 rounded-2xl font-bold text-gray-700 text-sm hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                {{ $t('detail.print') }}
              </button>
              <div v-if="!loggedIn" class="bg-white rounded-3xl shadow-md border border-gray-100 p-6 text-center">
                <h4 class="font-black text-gray-900 mb-2">{{ $t('detail.badges') }}</h4>
                <p class="text-xs text-gray-500 mb-4 leading-relaxed">{{ $t('detail.badgesDesc') }}</p>
                <div class="flex justify-center gap-2 mb-6">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">🎯</div>
                  <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">⭐</div>
                </div>
                <button 
                  @click="navigateTo(localePath('/auth/login'))"
                  class="w-full bg-gray-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-black shadow-lg transition-all active:scale-95"
                >
                  {{ $t('detail.loginToSave') }}
                </button>
              </div>
              <div v-else class="bg-blue-50 rounded-3xl border border-blue-100 p-6 text-center">
                <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-xl overflow-hidden">
                  <img v-if="user?.avatar" :src="user.avatar" class="w-full h-full object-cover" />
                  <span v-else>👋</span>
                </div>
                <h4 class="font-black text-blue-900 mb-4 text-sm">{{ user.name }}</h4>
                
                <!-- Badges Display -->
                <div class="border-t border-blue-200/50 pt-4 mt-2">
                  <p class="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-3">{{ $t('profile.badges') }}</p>
                  
                  <div v-if="badges?.length > 0" class="flex flex-wrap justify-center gap-2">
                    <NuxtLink v-for="badge in badges.slice(0, 5)" :key="badge.id" :to="localePath('/profile')" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm shadow-sm border border-blue-100 hover:scale-110 transition-transform" :title="badge.projectTitle">
                      🏆
                    </NuxtLink>
                    <NuxtLink v-if="badges.length > 5" :to="localePath('/profile')" class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm border border-blue-200 hover:scale-110 transition-transform">
                      +{{ badges.length - 5 }}
                    </NuxtLink>
                  </div>
                  
                  <div v-else class="text-xs text-blue-500 font-medium">
                    {{ $t('profile.noBadges').split('.')[0] }}
                  </div>
                  
                  <NuxtLink :to="localePath('/profile')" class="inline-block mt-4 text-xs font-bold text-blue-700 hover:underline">
                    {{ $t('nav.profile') }} &rarr;
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- CONTENT -->
        <main class="flex-1">
          <div class="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[600px] mb-8">
            <div class="p-6 sm:p-12">
              <div class="lg:hidden bg-gray-50 rounded-2xl p-4 mb-8 flex justify-between items-center border border-gray-100">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black text-white bg-green-600 w-6 h-6 rounded-full flex items-center justify-center">{{ currentStepIndex + 1 }}</span>
                  <span class="text-sm font-black text-gray-900">{{ steps[currentStepIndex]?.title }}</span>
                </div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ currentStepIndex + 1 }} {{ $t('detail.stepOf') }} {{ steps.length }}</p>
              </div>
              <div class="prose prose-lg prose-green max-w-none prose-headings:font-black prose-p:leading-relaxed prose-li:leading-relaxed">
                <ContentRenderer :value="currentStepContent" />
              </div>
            </div>
          </div>

          <!-- BOTTOM NAV -->
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button @click="prevStep" :disabled="currentStepIndex === 0" class="w-full sm:w-auto px-10 py-5 rounded-3xl font-black transition-all flex items-center justify-center group" :class="currentStepIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' : 'bg-white border-4 border-gray-100 text-gray-700 hover:border-gray-200 shadow-xl active:scale-95'">
              <svg class="w-6 h-6 mr-3 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
              {{ $t('detail.previous') }}
            </button>
            <button v-if="currentStepIndex < steps.length - 1" @click="nextStep" class="w-full sm:w-auto px-12 py-5 rounded-3xl font-black transition-all bg-green-600 hover:bg-green-500 text-white shadow-2xl active:scale-95 flex items-center justify-center group">
              {{ $t('detail.next') }}
              <svg class="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" /></svg>
            </button>
            <!-- Completion & Recommendation UI shown on the last step -->
            <div v-else class="w-full">
              <ProjectCompletion :project-slug="path" :project-title="project.title" @completed="refreshBadges" />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style>
.prose h2 { @apply text-3xl font-black mt-12 mb-6 text-gray-900 border-b-4 border-gray-100 pb-4 inline-block w-full; }
.prose h3 { @apply text-xl font-black mt-8 mb-4 text-gray-800; }
.prose p { @apply mb-6 text-gray-700 leading-relaxed; }
.prose li { @apply mb-2 text-gray-700; }
</style>
