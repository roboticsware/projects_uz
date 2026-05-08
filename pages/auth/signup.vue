<script setup>
const { fetch: fetchSession } = useUserSession()
const localePath = useLocalePath()
const route = useRoute()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('student') // 기본값: 학생
const isLoading = ref(false)
const error = ref('')

async function signup() {
  isLoading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value, role: role.value }
    })
    await fetchSession()
    const redirectPath = route.query.redirect
    navigateTo(redirectPath || localePath('/'))
  } catch (e) {
    error.value = e.data?.message || 'Signup failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black text-gray-900 mb-2">{{ $t('auth.signupTitle') }}</h1>
        <p class="text-gray-500 font-medium">{{ $t('auth.signupSubtitle') }}</p>
      </div>

      <form @submit.prevent="signup" class="space-y-5">

        <!-- 역할 선택 (카드 방식) -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-3">저는 ...</label>
          <div class="grid grid-cols-2 gap-3">
            <!-- 학생 -->
            <label
              class="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all"
              :class="role === 'student'
                ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                : 'border-gray-200 hover:border-gray-300 bg-white'">
              <input type="radio" value="student" v-model="role" class="hidden">
              <span class="text-3xl">🎒</span>
              <span class="font-black text-sm" :class="role === 'student' ? 'text-blue-700' : 'text-gray-700'">학생</span>
              <span class="text-[10px] text-center leading-tight" :class="role === 'student' ? 'text-blue-500' : 'text-gray-400'">
                프로젝트를 학습해요
              </span>
              <div v-if="role === 'student'" class="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </div>
            </label>

            <!-- 교사 -->
            <label
              class="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all"
              :class="role === 'teacher'
                ? 'border-green-500 bg-green-50 shadow-md shadow-green-100'
                : 'border-gray-200 hover:border-gray-300 bg-white'">
              <input type="radio" value="teacher" v-model="role" class="hidden">
              <span class="text-3xl">👨‍🏫</span>
              <span class="font-black text-sm" :class="role === 'teacher' ? 'text-green-700' : 'text-gray-700'">교사 / 강사</span>
              <span class="text-[10px] text-center leading-tight" :class="role === 'teacher' ? 'text-green-500' : 'text-gray-400'">
                콘텐츠를 직접 제작해요
              </span>
              <div v-if="role === 'teacher'" class="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </div>
            </label>
          </div>
          <!-- 교사 선택 시 안내 -->
          <p v-if="role === 'teacher'" class="mt-2 text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2 font-medium">
            ✅ 가입 후 프로젝트를 직접 작성하고 심사 요청할 수 있습니다.
          </p>
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('auth.name') }}</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="홍길동"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('auth.email') }}</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('auth.password') }}</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            :placeholder="$t('auth.passwordPlaceholder')"
          />
        </div>

        <p v-if="error" class="text-red-500 text-xs font-bold">{{ error }}</p>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-4 rounded-xl font-bold transition-colors shadow-lg disabled:opacity-50"
          :class="role === 'teacher'
            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/10'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10'"
        >
          {{ isLoading ? '...' : $t('auth.signupBtn') }}
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-gray-500 font-medium">
        {{ $t('auth.hasAccount') }}
        <NuxtLink :to="localePath('/auth/login')" class="text-blue-600 font-bold hover:underline">{{ $t('auth.loginBtn') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>
