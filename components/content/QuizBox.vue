<template>
  <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
    <h3 class="text-xl font-bold mb-4 text-blue-800">Quiz Time!</h3>
    <p class="font-medium mb-4 text-lg">{{ question }}</p>
    <div class="space-y-2">
      <button 
        v-for="opt in options" 
        :key="opt"
        @click="checkAnswer(opt)"
        :class="[
          'block w-full text-left px-4 py-3 rounded-md border transition',
          selected === opt ? (opt === answer ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800') : 'bg-white hover:bg-gray-50 border-gray-200'
        ]"
      >
        {{ opt }}
      </button>
    </div>
    <p v-if="selected" class="mt-4 font-bold" :class="selected === answer ? 'text-green-600' : 'text-red-600'">
      {{ selected === answer ? 'Correct!' : 'Try again!' }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: String,
  options: Array,
  answer: String
})

const selected = ref(null)

const checkAnswer = (opt) => {
  selected.value = opt
}
</script>
