<script setup>
definePageMeta({ middleware: 'admin' })

const { user } = useUserSession()
const localePath = useLocalePath()

// 탭 상태
const activeTab = ref('review') // 'review' | 'users'

// 심사 관련
const { data: projects, refresh: refreshProjects } = await useFetch('/api/admin/projects', { server: false })
const selectedProject = ref(null)
const reviewComment = ref('')
const isReviewing = ref(false)

// 사용자 관련
const { data: userList, refresh: refreshUsers } = await useFetch('/api/admin/users', { server: false })
const isChangingRole = ref(null) // userId

// 필터
const statusFilter = ref('review')

const filteredProjects = computed(() => {
  if (!projects.value) return []
  if (statusFilter.value === 'all') return projects.value
  return projects.value.filter(p => p.status === statusFilter.value)
})

const reviewCount = computed(() =>
  projects.value?.filter(p => p.status === 'review').length ?? 0
)

// 상태 정보
const statusConfig = {
  draft:     { label: '초안',    color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  review:    { label: '심사 중', color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
  published: { label: '게시됨',  color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  rejected:  { label: '반려됨',  color: 'bg-red-100 text-red-600',     dot: 'bg-red-400' },
}

const roleConfig = {
  student:   { label: '학생',    color: 'bg-blue-100 text-blue-700',    icon: '🎒' },
  teacher:   { label: '교사',    color: 'bg-green-100 text-green-700',  icon: '👨‍🏫' },
  sub_admin: { label: '부관리자', color: 'bg-purple-100 text-purple-700', icon: '🔧' },
  admin:     { label: '관리자',  color: 'bg-red-100 text-red-700',      icon: '👑' },
}

function selectProject(project) {
  selectedProject.value = selectedProject.value?.id === project.id ? null : project
  reviewComment.value = ''
}

async function submitReview(status) {
  if (!selectedProject.value) return
  isReviewing.value = true
  try {
    const result = await $fetch('/api/admin/review', {
      method: 'POST',
      body: {
        projectId: selectedProject.value.id,
        status,
        comment: reviewComment.value,
      }
    })
    await refreshProjects()
    selectedProject.value = null
    reviewComment.value = ''
    alert(status === 'approved' ? '✅ 게시 승인되었습니다!' : status === 'rejected' ? '❌ 반려 처리되었습니다.' : '🔄 수정 요청을 전송했습니다.')
  } catch (e) {
    alert('처리 중 오류가 발생했습니다.')
  } finally {
    isReviewing.value = false
  }
}

async function changeRole(userId, newRole) {
  isChangingRole.value = userId
  try {
    await $fetch('/api/admin/user-role', {
      method: 'POST',
      body: { userId, role: newRole }
    })
    await refreshUsers()
  } catch (e) {
    alert(e.data?.statusMessage || '역할 변경 중 오류가 발생했습니다.')
  } finally {
    isChangingRole.value = null
  }
}

function getTitle(project) {
  return project.translations?.[0]?.title || '(제목 없음)'
}
function getLocale(project) {
  return project.translations?.[0]?.locale || project.primaryLocale
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 헤더 -->
    <div class="bg-[#1a1a1a] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink :to="localePath('/')" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </NuxtLink>
          <div>
            <h1 class="text-xl font-black tracking-tight">🛡️ 관리자 대시보드</h1>
            <p class="text-xs text-gray-400 mt-0.5">콘텐츠 심사 및 사용자 관리</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <!-- 심사 대기 배지 -->
          <div v-if="reviewCount > 0" class="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-xl px-3 py-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="text-amber-300 text-xs font-black">심사 대기 {{ reviewCount }}건</span>
          </div>
          <span class="text-xs text-gray-400">
            {{ roleConfig[user?.role]?.icon }} {{ user?.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 py-1">
        <button
          v-for="tab in [
            { key: 'review', label: '📋 콘텐츠 심사', badge: reviewCount },
            { key: 'users', label: '👥 사용자 관리' }
          ]" :key="tab.key"
          @click="activeTab = tab.key"
          class="px-5 py-3 text-sm font-bold rounded-t-xl transition-all flex items-center gap-2"
          :class="activeTab === tab.key
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'">
          {{ tab.label }}
          <span v-if="tab.badge" class="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
            {{ tab.badge }}
          </span>
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- ===== 콘텐츠 심사 탭 ===== -->
      <div v-if="activeTab === 'review'" class="flex gap-6">

        <!-- 왼쪽: 프로젝트 목록 -->
        <div class="w-80 flex-shrink-0 space-y-3">
          <!-- 필터 -->
          <div class="flex gap-1.5 flex-wrap">
            <button v-for="f in [
              { val: 'review', label: '심사 중' },
              { val: 'published', label: '게시됨' },
              { val: 'rejected', label: '반려됨' },
              { val: 'draft', label: '초안' },
              { val: 'all', label: '전체' },
            ]" :key="f.val"
              @click="statusFilter = f.val; selectedProject = null"
              class="px-3 py-1 text-xs font-bold rounded-full border transition-all"
              :class="statusFilter === f.val
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'">
              {{ f.label }}
              <span v-if="f.val !== 'all'" class="ml-1 text-[10px]">
                ({{ projects?.filter(p => p.status === f.val).length ?? 0 }})
              </span>
            </button>
          </div>

          <!-- 프로젝트 카드 목록 -->
          <div class="space-y-2">
            <div v-if="!filteredProjects.length" class="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
              <div class="text-3xl mb-2">📭</div>
              <p class="text-sm font-bold">해당하는 프로젝트가 없습니다</p>
            </div>

            <div v-for="project in filteredProjects" :key="project.id"
              @click="selectProject(project)"
              class="bg-white rounded-2xl p-4 border cursor-pointer transition-all"
              :class="selectedProject?.id === project.id
                ? 'border-gray-900 shadow-lg ring-2 ring-gray-900/10'
                : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'">
              <!-- 상태 뱃지 -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                  :class="statusConfig[project.status]?.color">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[project.status]?.dot"></span>
                  {{ statusConfig[project.status]?.label }}
                </span>
                <span class="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-mono">#{{ project.id }}</span>
              </div>
              <!-- 제목 -->
              <h3 class="font-bold text-sm text-gray-900 line-clamp-2 leading-tight mb-2">
                {{ getTitle(project) }}
              </h3>
              <!-- 저자 정보 -->
              <div class="flex items-center gap-2">
                <img :src="project.author?.avatar" class="w-5 h-5 rounded-full bg-gray-100" alt="">
                <span class="text-xs text-gray-500 font-medium">{{ project.author?.name }}</span>
                <span class="text-[10px] text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded-full uppercase font-bold ml-auto">
                  {{ getLocale(project) }}
                </span>
              </div>
              <p class="text-[10px] text-gray-400 mt-1.5">
                {{ new Date(project.updatedAt).toLocaleString('ko-KR') }}
              </p>
            </div>
          </div>
        </div>

        <!-- 오른쪽: 상세 심사 패널 -->
        <div class="flex-1 min-w-0">
          <!-- 미선택 상태 -->
          <div v-if="!selectedProject" class="bg-white rounded-3xl border border-gray-100 p-16 text-center text-gray-400 h-full flex flex-col items-center justify-center gap-4">
            <div class="text-6xl">👈</div>
            <p class="font-bold text-gray-500">왼쪽 목록에서 프로젝트를 선택하세요</p>
            <p class="text-sm">선택하면 본문 내용과 심사 도구가 표시됩니다</p>
          </div>

          <!-- 선택된 프로젝트 심사 패널 -->
          <div v-else class="space-y-4">
            <!-- 프로젝트 헤더 -->
            <div class="bg-white rounded-2xl border border-gray-100 p-6">
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-[11px] font-black px-2 py-0.5 rounded-full"
                      :class="statusConfig[selectedProject.status]?.color">
                      {{ statusConfig[selectedProject.status]?.label }}
                    </span>
                    <span class="text-xs text-gray-400 font-mono">#{{ selectedProject.id }}</span>
                  </div>
                  <h2 class="text-2xl font-black text-gray-900">{{ getTitle(selectedProject) }}</h2>
                  <p class="text-sm text-gray-500 mt-1">{{ selectedProject.translations?.[0]?.description }}</p>
                </div>
                <button @click="selectedProject = null" class="text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <!-- 메타 정보 -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-gray-50 rounded-xl p-3">
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">저자</p>
                  <div class="flex items-center gap-1.5">
                    <img :src="selectedProject.author?.avatar" class="w-5 h-5 rounded-full" alt="">
                    <span class="text-xs font-bold text-gray-700">{{ selectedProject.author?.name }}</span>
                  </div>
                </div>
                <div class="bg-gray-50 rounded-xl p-3">
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">언어</p>
                  <p class="text-sm font-black text-gray-700 uppercase">{{ getLocale(selectedProject) }}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-3">
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">난이도</p>
                  <p class="text-sm font-black text-gray-700">{{ selectedProject.translations?.[0]?.difficulty || '미설정' }}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-3">
                  <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">제출일</p>
                  <p class="text-xs font-bold text-gray-700">{{ new Date(selectedProject.updatedAt).toLocaleDateString('ko-KR') }}</p>
                </div>
              </div>
            </div>

            <!-- 본문 미리보기 -->
            <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div class="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                <span class="text-xs font-black uppercase text-gray-500 tracking-widest">📄 본문 내용</span>
              </div>
              <div class="p-6 max-h-96 overflow-y-auto">
                <pre class="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{{ selectedProject.translations?.[0]?.content || '(본문 없음)' }}</pre>
              </div>
            </div>

            <!-- 심사 액션 패널 (심사 중인 프로젝트만) -->
            <div v-if="selectedProject.status === 'review'" class="bg-white rounded-2xl border-2 border-amber-200 p-6">
              <h3 class="text-sm font-black uppercase text-amber-700 tracking-widest mb-4">⚖️ 심사 결정</h3>
              <div class="mb-4">
                <label class="block text-xs font-bold text-gray-600 mb-1.5">피드백 메모 (선택사항)</label>
                <textarea v-model="reviewComment" rows="3" placeholder="저자에게 전달할 피드백을 입력하세요..."
                  class="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none placeholder-gray-300"></textarea>
              </div>
              <div class="flex gap-3">
                <button @click="submitReview('revision')"
                  :disabled="isReviewing"
                  class="flex-1 px-4 py-3 rounded-xl font-bold text-sm border-2 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-40 transition-all">
                  🔄 수정 요청
                </button>
                <button @click="submitReview('rejected')"
                  :disabled="isReviewing"
                  class="flex-1 px-4 py-3 rounded-xl font-bold text-sm border-2 border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40 transition-all">
                  ❌ 반려
                </button>
                <button @click="submitReview('approved')"
                  :disabled="isReviewing"
                  class="flex-1 px-4 py-3 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-40 transition-all active:scale-95">
                  ✅ 게시 승인
                </button>
              </div>
            </div>

            <!-- 이미 처리된 프로젝트 -->
            <div v-else class="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
              이 프로젝트는 이미 <strong>{{ statusConfig[selectedProject.status]?.label }}</strong> 상태입니다.
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 사용자 관리 탭 ===== -->
      <div v-if="activeTab === 'users'">
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 class="font-black text-gray-700 text-sm uppercase tracking-widest">👥 전체 사용자 ({{ userList?.length ?? 0 }}명)</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-if="!userList?.length" class="p-12 text-center text-gray-400">
              사용자가 없습니다.
            </div>
            <div v-for="u in userList" :key="u.id"
              class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <!-- 아바타 -->
              <img :src="u.avatar" class="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" alt="">
              <!-- 정보 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-bold text-gray-900 text-sm">{{ u.name }}</p>
                  <span v-if="u.id === user?.id" class="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">나</span>
                </div>
                <p class="text-xs text-gray-400">{{ u.email }}</p>
              </div>
              <!-- 현재 역할 뱃지 -->
              <span class="text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0"
                :class="roleConfig[u.role]?.color">
                {{ roleConfig[u.role]?.icon }} {{ roleConfig[u.role]?.label }}
              </span>
              <!-- 역할 변경 (admin만, 자신 제외) -->
              <div v-if="user?.role === 'admin' && u.id !== user?.id" class="flex-shrink-0">
                <select
                  :value="u.role"
                  @change="changeRole(u.id, $event.target.value)"
                  :disabled="isChangingRole === u.id"
                  class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all disabled:opacity-40 font-bold text-gray-700 cursor-pointer">
                  <option value="student">🎒 학생</option>
                  <option value="teacher">👨‍🏫 교사</option>
                  <option value="sub_admin">🔧 부관리자</option>
                  <option value="admin">👑 관리자</option>
                </select>
              </div>
              <!-- 가입일 -->
              <p class="text-[10px] text-gray-400 flex-shrink-0 hidden sm:block">
                {{ new Date(u.createdAt).toLocaleDateString('ko-KR') }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
