<script setup>
const { loggedIn, user, fetch: fetchSession } = useUserSession()
const localePath = useLocalePath()
const route = useRoute()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

async function login() {
  isLoading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await fetchSession()
    
    // Redirect back to original page if exists, otherwise go to home
    const redirectPath = route.query.redirect
    navigateTo(redirectPath || localePath('/'))
  } catch (e) {
    error.value = e.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black text-gray-900 mb-2">{{ $t('auth.loginTitle') }}</h1>
        <p class="text-gray-500 font-medium">{{ $t('auth.loginSubtitle') }}</p>
      </div>

      <!-- Email Login Form -->
      <form @submit.prevent="login" class="space-y-4 mb-6">
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
            placeholder="••••••••"
          />
        </div>
        
        <p v-if="error" class="text-red-500 text-xs font-bold">{{ $t('auth.errorInvalid') }}</p>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 disabled:opacity-50"
        >
          {{ isLoading ? '...' : $t('auth.loginBtn') }}
        </button>
      </form>

      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100"></div></div>
        <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-4 text-gray-400 font-bold tracking-widest">OR</span></div>
      </div>

      <!-- Social Login Options -->
      <div class="space-y-3">
        <a 
          href="/auth/google" 
          class="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-3.71 0-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          {{ $t('auth.googleBtn') }}
        </a>
      </div>

      <p class="mt-8 text-center text-sm text-gray-500 font-medium">
        {{ $t('auth.noAccount') }}
        <NuxtLink :to="localePath('/auth/signup')" class="text-blue-600 font-bold hover:underline">{{ $t('auth.signupBtn') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>
