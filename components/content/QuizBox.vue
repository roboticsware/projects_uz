<template>
  <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-black text-blue-900">{{ $t('quiz.title') }}</h3>
      <span class="text-sm font-bold px-3 py-1 rounded-full" :class="quizState.attempts > 2 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-800'">
        {{ $t('quiz.attempt', { n: Math.min(quizState.attempts + 1, 5) }) }}
      </span>
    </div>

    <!-- Warning Message -->
    <div v-if="!quizState.passed && !quizState.locked" class="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-bold p-3 rounded-lg mb-4 flex items-center gap-2">
      <span>⚠️</span> {{ $t('quiz.warning') }}
    </div>

    <p class="font-bold text-gray-800 mb-6 text-lg">{{ question }}</p>
    
    <div class="space-y-3">
      <button 
        v-for="opt in options" 
        :key="opt"
        @click="checkAnswer(opt)"
        :disabled="quizState.locked || quizState.passed"
        :class="[
          'block w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium',
          selected === opt ? (opt === answer ? 'bg-green-50 border-green-500 text-green-900 shadow-md' : 'bg-red-50 border-red-500 text-red-900') : 'bg-white hover:bg-blue-50 hover:border-blue-200 border-gray-200 text-gray-700',
          (quizState.locked || quizState.passed) && selected !== opt ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <div class="flex justify-between items-center">
          <span>{{ opt }}</span>
          <span v-if="selected === opt" class="text-xl">
            {{ opt === answer ? '✅' : '❌' }}
          </span>
        </div>
      </button>
    </div>

    <!-- Result Messages -->
    <div v-if="quizState.passed" class="mt-6 bg-green-100 text-green-800 p-4 rounded-xl font-bold flex items-center gap-2 animate-fade-in">
      <span>🎉</span> {{ $t('quiz.correct') }}
    </div>
    <div v-else-if="quizState.locked" class="mt-6 bg-red-100 text-red-800 p-4 rounded-xl font-bold flex items-center gap-2 animate-fade-in">
      <span>🔒</span> {{ $t('quiz.locked') }}
    </div>
    <div v-else-if="selected && selected !== answer" class="mt-4 text-red-600 font-bold text-sm">
      {{ $t('quiz.incorrect', { n: 5 - quizState.attempts }) }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: String,
  options: Array,
  answer: String
})

const route = useRoute()
// Share state with ProjectCompletion component
const quizState = useState(`quiz-${route.path}`, () => ({
  passed: false,
  attempts: 0,
  locked: false
}))

const selected = ref(null)

const checkAnswer = (opt) => {
  if (quizState.value.locked || quizState.value.passed) return
  
  selected.value = opt
  
  if (opt === props.answer) {
    quizState.value.passed = true
  } else {
    quizState.value.attempts++
    if (quizState.value.attempts >= 5) {
      quizState.value.locked = true
    }
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
