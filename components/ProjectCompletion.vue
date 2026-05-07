<script setup>
import confetti from 'canvas-confetti'

const props = defineProps({
  projectSlug: {
    type: String,
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['completed'])

const isCompleted = ref(false)
const isLoading = ref(false)
const recommendedProject = ref(null)

const route = useRoute()
const localePath = useLocalePath()
const { loggedIn, user } = useUserSession()

// Read the global quiz state set by QuizBox.vue
const quizState = useState(`quiz-${route.path}`, () => ({
  passed: false,
  attempts: 0,
  locked: false
}))

const completeProject = async () => {
  isLoading.value = true
  try {
    // Call our backend API to save progress
    const { data } = await useFetch('/api/projects/complete', {
      method: 'POST',
      body: { projectSlug: props.projectSlug }
    })
    
    isCompleted.value = true
    recommendedProject.value = data.value?.nextProject
    
    // Notify parent to refresh badge list
    emit('completed')
    
    // Trigger celebration effect
    triggerConfetti()
  } catch (error) {
    console.error('Failed to complete project', error)
    alert('Failed to save progress. Are you logged in?')
  } finally {
    isLoading.value = false
  }
}

const triggerConfetti = () => {
  const duration = 3 * 1000
  const end = Date.now() + duration

  ;(function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
}
</script>

<template>
  <div class="mt-16 border-t border-gray-200 pt-12">
    <!-- Not Completed State -->
    <div v-if="!isCompleted" class="max-w-2xl mx-auto text-center">
      <!-- Locked Out State -->
      <div v-if="quizState.locked" class="bg-red-50 border border-red-200 rounded-2xl p-8">
        <div class="text-4xl mb-4">🔒</div>
        <h3 class="text-2xl font-black text-red-700 mb-2">{{ $t('quiz.locked') }}</h3>
      </div>

      <!-- Quiz Pending State -->
      <div v-else-if="!quizState.passed" class="bg-gray-50 border border-gray-200 rounded-2xl p-8">
        <div class="text-4xl mb-4">📝</div>
        <h3 class="text-2xl font-black text-gray-500 mb-2">{{ $t('quiz.required') }}</h3>
        <p class="text-gray-500 font-medium">{{ $t('quiz.requiredDesc') }}</p>
      </div>

      <!-- Ready to Claim State -->
      <div v-else class="animate-fade-in">
        <h3 class="text-2xl font-black text-gray-900 mb-4">{{ $t('quiz.passed') }} 🎉</h3>
        
        <template v-if="loggedIn">
          <button 
            @click="completeProject"
            :disabled="isLoading"
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:-translate-y-1 transition-transform disabled:opacity-50 w-full"
          >
            <span v-if="isLoading">{{ $t('list.searchPlaceholder').includes('qidirish') ? 'Saqlanmoqda...' : '저장 중...' }}</span>
            <span v-else>{{ $t('quiz.claimBtn') }} 🏆</span>
          </button>
        </template>
        
        <template v-else>
          <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-4 text-left">
            <p class="text-yellow-800 text-sm font-bold mb-1">{{ $t('quiz.almostThere') }}</p>
            <p class="text-yellow-700 text-xs">{{ $t('quiz.loginToSaveDesc') }}</p>
          </div>
          <button 
            @click="navigateTo(localePath({ path: '/auth/login', query: { redirect: route.fullPath } }))"
            class="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:-translate-y-1 transition-transform w-full"
          >
            {{ $t('auth.loginBtn') }} & {{ $t('quiz.claimBtn') }} 🏆
          </button>
        </template>
      </div>
    </div>

    <!-- Completed State (Celebration UI) -->
    <div v-else class="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 text-center animate-fade-in relative overflow-hidden">
      <!-- Decorative Confetti SVG Placeholder -->
      <div class="text-6xl mb-6 animate-bounce">🎉</div>
      
      <h3 class="text-3xl font-black text-gray-900 mb-2">
        {{ $t('completion.congrats') }} {{ projectTitle }}
      </h3>
      <p class="text-gray-600 mb-8 font-medium">
        {{ $t('completion.wellDone') }}
      </p>

      <!-- Next Project Recommendation -->
      <div v-if="recommendedProject" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto text-left">
        <h4 class="font-black text-gray-900 mb-4 text-center">{{ $t('completion.whatsNext') }}</h4>
        <div class="flex items-center justify-between gap-6">
          <div>
            <h5 class="font-bold text-lg text-gray-900">{{ recommendedProject.title }}</h5>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ recommendedProject.description }}</p>
          </div>
          <NuxtLink 
            :to="recommendedProject._path"
            class="whitespace-nowrap bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            {{ $t('completion.startProject') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
