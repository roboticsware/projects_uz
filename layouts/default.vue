<script setup>
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
const { user, loggedIn, clear } = useUserSession()

const locales = [
  { code: 'uz', name: 'Oʻzbekcha' },
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' }
]

const currentLocaleName = computed(() => {
  return locales.find(l => l.code === locale.value)?.name || 'Language'
})

const isLangOpen = ref(false)
const isUserMenuOpen = ref(false)
const isMobileMenuOpen = ref(false)

// Close mobile menu on route change
const route = useRoute()
watch(route, () => {
  isMobileMenuOpen.value = false
})

async function logout() {
  await clear()
  isUserMenuOpen.value = false
  navigateTo(localePath('/'))
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <!-- TOP DARK BAR -->
    <header class="bg-[#1a1a1a] text-white py-2 px-4 sm:px-6 lg:px-8 z-50 relative">
      <div class="max-w-7xl mx-auto flex justify-between items-center h-10">
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2 group cursor-pointer">
          <!-- Robot Logo Icon (Original "Open" Style) -->
          <div class="w-8 h-8 group-hover:scale-110 transition-transform duration-300">
            <svg viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <!-- Top bar -->
              <rect x="1" y="0" width="3" height="1" fill="#8EBAF7" />
              <!-- Upper side pixels -->
              <rect x="0" y="1" width="1" height="1" fill="#8EBAF7" />
              <rect x="4" y="1" width="1" height="1" fill="#8EBAF7" />
              <!-- Eyes (Middle row is open on sides!) -->
              <rect x="1.5" y="2" width="0.7" height="1" fill="#8EBAF7" />
              <rect x="2.8" y="2" width="0.7" height="1" fill="#8EBAF7" />
              <!-- Lower side pixels -->
              <rect x="0" y="3" width="1" height="1" fill="#8EBAF7" />
              <rect x="4" y="3" width="1" height="1" fill="#8EBAF7" />
              <!-- Bottom bar -->
              <rect x="1" y="4" width="3" height="1" fill="#8EBAF7" />
            </svg>
          </div>
          <span class="font-black text-lg tracking-tight text-white">Robotics<span class="text-blue-500">ware</span></span>
        </NuxtLink>

        <!-- Right Side: Language & Auth -->
        <div class="flex items-center gap-4 sm:gap-6">
          <!-- Language Selector -->
          <div class="relative">
            <button 
              @click="isLangOpen = !isLangOpen"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs font-bold border border-white/20"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.6 9h16.8M3.6 15h16.8" />
              </svg>
              {{ currentLocaleName }}
              <svg class="w-3 h-3 transition-transform" :class="isLangOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Language Dropdown -->
            <div v-if="isLangOpen" @click.away="isLangOpen = false" class="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[60]">
              <NuxtLink 
                v-for="l in locales" 
                :key="l.code"
                :to="switchLocalePath(l.code)"
                @click="isLangOpen = false"
                class="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0"
              >
                {{ l.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Auth State -->
          <div class="hidden sm:flex items-center gap-4 text-xs font-bold relative">
            <template v-if="loggedIn">
              <button 
                @click="isUserMenuOpen = !isUserMenuOpen"
                class="flex items-center gap-2 hover:text-blue-400 transition-colors focus:outline-none"
              >
                <img :src="user.avatar" class="w-7 h-7 rounded-full border-2 border-gray-700 bg-gray-800" alt="Avatar" />
                <span>{{ user.name }}</span>
                <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': isUserMenuOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- User Dropdown Menu -->
              <div v-if="isUserMenuOpen" @click.away="isUserMenuOpen = false" class="absolute right-0 mt-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[60] py-1">
                <NuxtLink 
                  :to="localePath('/profile')"
                  @click="isUserMenuOpen = false"
                  class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {{ $t('nav.profile') }}
                </NuxtLink>
                <div class="border-t border-gray-50 my-1"></div>
                <button 
                  @click="logout"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  {{ $t('nav.logout') }}
                </button>
              </div>
            </template>
            <template v-else>
              <NuxtLink :to="localePath('/auth/signup')" class="hover:text-blue-400 transition-colors">{{ $t('nav.signUp') }}</NuxtLink>
              <NuxtLink :to="localePath('/auth/login')" class="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                {{ $t('nav.logIn') }}
              </NuxtLink>
            </template>
          </div>

          <!-- Mobile Menu Button (Hamburger) -->
          <button 
            class="sm:hidden flex items-center p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Dropdown Panel -->
      <transition name="slide-down">
        <div v-if="isMobileMenuOpen" class="sm:hidden absolute top-full left-0 w-full bg-[#1a1a1a] border-t border-white/10 shadow-2xl z-40">
          <div class="px-4 py-6 space-y-4">
            <template v-if="loggedIn">
              <div class="flex items-center gap-4 px-2 mb-6">
                <img :src="user.avatar" class="w-12 h-12 rounded-full border-2 border-gray-700 bg-gray-800" alt="Avatar" />
                <div>
                  <p class="text-white font-extrabold text-lg">{{ user.name }}</p>
                  <p class="text-gray-400 text-xs">{{ user.email }}</p>
                </div>
              </div>
              <NuxtLink :to="localePath('/profile')" class="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-white font-bold hover:bg-white/10 transition-colors">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {{ $t('nav.profile') }}
              </NuxtLink>
              <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 rounded-xl text-red-500 font-bold hover:bg-red-500/20 transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                {{ $t('nav.logout') }}
              </button>
            </template>
            <template v-else>
              <NuxtLink :to="localePath('/auth/login')" class="block w-full text-center bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-colors shadow-lg">
                {{ $t('nav.logIn') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/auth/signup')" class="block w-full text-center text-white font-bold py-3.5 border border-white/20 rounded-xl hover:bg-white/10 transition-colors mt-3">
                {{ $t('nav.signUp') }}
              </NuxtLink>
            </template>
          </div>
        </div>
      </transition>
    </header>

    <!-- SECONDARY WHITE NAV -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <ul class="flex items-center gap-8 h-full">
          <li class="h-full">
            <NuxtLink :to="localePath('/')" class="flex items-center h-full px-2 border-b-4 transition-all font-bold text-sm" :class="$route.path === localePath('/') ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'">
              {{ $t('nav.home') }}
            </NuxtLink>
          </li>
          <li class="h-full">
            <NuxtLink :to="localePath('/projects')" class="flex items-center h-full px-2 border-b-4 transition-all font-bold text-sm" :class="$route.path.includes('/projects') ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'">
              {{ $t('nav.projects') }}
            </NuxtLink>
          </li>
        </ul>

        <!-- Search Link (Inspired by Image) -->
        <NuxtLink :to="localePath('/projects')" class="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all group font-black text-sm">
          <span>{{ $t('nav.findProject') }}</span>
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </NuxtLink>
      </div>
    </nav>

    <!-- PAGE CONTENT -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- FOOTER (Optional) -->
    <footer class="bg-gray-100 border-t border-gray-200 py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-sm text-gray-500">© 2024 Roboticsware. {{ $t('nav.footerSlogan') }}</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Custom transitions for the dropdown */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile menu slide down transition */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease-in-out;
  transform-origin: top;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: scaleY(0);
}
</style>
