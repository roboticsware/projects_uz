<script setup>
const { t } = useI18n()
const localePath = useLocalePath()
definePageMeta({
  middleware: 'auth'
})

const { user, clear } = useUserSession()

const { data: badges } = await useFetch('/api/user/badges')

const isDeleting = ref(false)

const deleteAccount = async () => {
  if (!confirm(t('profile.confirmDelete'))) return
  
  isDeleting.value = true
  try {
    await useFetch('/api/user/delete', { method: 'DELETE' })
    await clear() // Clear auth session
    navigateTo('/')
  } catch (error) {
    console.error(error)
    alert('Failed to delete account')
  } finally {
    isDeleting.value = false
  }
}

const logout = async () => {
  await clear()
  navigateTo('/')
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <!-- User Header -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-6 mb-8">
      <img :src="user?.avatar" alt="Avatar" class="w-24 h-24 rounded-full bg-gray-100" />
      <div class="flex-grow">
        <h1 class="text-3xl font-black text-gray-900">{{ user?.name }}</h1>
        <p class="text-gray-500 font-medium">{{ user?.email }}</p>
        <!-- Role Badge -->
        <div class="mt-2 flex items-center gap-2 flex-wrap">
          <span v-if="user?.role === 'student'"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700">
            🎒 학생
          </span>
          <span v-else-if="user?.role === 'teacher'"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-700">
            👨‍🏫 교사 / 강사
          </span>
          <span v-else-if="user?.role === 'sub_admin'"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-700">
            🔧 부관리자
          </span>
          <span v-else-if="user?.role === 'admin'"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700">
            👑 관리자
          </span>
          <!-- 교사 이상: 작성 페이지 바로가기 -->
          <NuxtLink v-if="['teacher','sub_admin','admin'].includes(user?.role)"
            :to="localePath('/write')"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors">
            ✍️ 내 콘텐츠 작성하기 →
          </NuxtLink>
        </div>
      </div>
      <button @click="logout" class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
        {{ $t('nav.logout') }}
      </button>
    </div>

    <!-- Badges Section -->
    <div class="mb-12">
      <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        {{ $t('profile.badges') }} 🏆
      </h2>
      
      <div v-if="badges?.length === 0" class="bg-gray-50 rounded-2xl p-8 text-center text-gray-500">
        {{ $t('profile.noBadges') }}
      </div>
      
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="badge in badges" :key="badge.id" class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 text-center border border-yellow-100 shadow-sm">
          <div class="text-4xl mb-3">🏅</div>
          <h3 class="font-bold text-sm text-gray-900">{{ badge.projectName }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ new Date(badge.earnedAt).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="border border-red-100 rounded-3xl p-8 bg-red-50/30 mt-16">
      <h2 class="text-xl font-black text-red-600 mb-2">{{ $t('profile.dangerZone') }}</h2>
      <p class="text-red-500 text-sm mb-6">{{ $t('profile.deleteDesc') }}</p>
      <button 
        @click="deleteAccount"
        :disabled="isDeleting"
        class="bg-red-100 text-red-600 hover:bg-red-200 px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
      >
        {{ isDeleting ? '...' : $t('profile.deleteBtn') }}
      </button>
    </div>
  </div>
</template>
