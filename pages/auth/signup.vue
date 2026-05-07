<script setup>
const { fetch: fetchSession } = useUserSession()
const localePath = useLocalePath()

const name = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

async function signup() {
  isLoading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value }
    })
    await fetchSession()
    navigateTo(localePath('/'))
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
        <h1 class="text-3xl font-black text-gray-900 mb-2">Create Account</h1>
        <p class="text-gray-500 font-medium">Start your learning journey today</p>
      </div>

      <form @submit.prevent="signup" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
          <input 
            v-model="name" 
            type="text" 
            required 
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="At least 8 characters"
          />
        </div>
        
        <p v-if="error" class="text-red-500 text-xs font-bold">{{ error }}</p>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10 disabled:opacity-50"
        >
          {{ isLoading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-gray-500 font-medium">
        Already have an account? 
        <NuxtLink :to="localePath('/auth/login')" class="text-blue-600 font-bold hover:underline">Log in</NuxtLink>
      </p>
    </div>
  </div>
</template>
