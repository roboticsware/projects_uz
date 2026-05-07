<script setup>
const props = defineProps({
  code: { type: String, default: '' },
  language: { type: String, default: null },
  filename: { type: String, default: null },
  highlights: { type: Array, default: () => [] },
  meta: { type: String, default: null },
  class: { type: String, default: null }
})

const isCopied = ref(false)

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy!', err)
  }
}
</script>

<template>
  <div class="code-block-wrapper group relative my-8 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-[#0d1117]">
    <!-- Header with Language and Copy Button -->
    <div class="flex items-center justify-between bg-[#161b22] px-6 py-2 border-b border-gray-800">
      <span class="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
        {{ language || 'CODE' }}
      </span>
      
      <button 
        @click="copyCode"
        class="flex items-center gap-1.5 text-[10px] font-bold transition-all duration-200"
        :class="isCopied ? 'text-green-500' : 'text-gray-400 hover:text-white'"
      >
        <span v-if="isCopied">Copied!</span>
        <span v-else>Copy</span>
        
        <svg v-if="!isCopied" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>

    <!-- The actual pre block -->
    <pre :class="props.class" class="!m-0 !p-0"><slot /></pre>
  </div>
</template>

<style>
/* Adjusting the internal code styling since it's now wrapped */
.code-block-wrapper pre code {
  @apply block p-6 text-sm font-mono leading-relaxed bg-transparent text-gray-300 !important;
  counter-reset: line;
}

.code-block-wrapper .line {
  @apply flex;
}

.code-block-wrapper .line::before {
  counter-increment: line;
  content: counter(line);
  @apply inline-block w-5 mr-6 text-right text-gray-600 font-mono text-xs select-none flex-shrink-0;
}
</style>
