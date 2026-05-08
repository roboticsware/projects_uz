<script setup>
definePageMeta({ middleware: 'teacher' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { user } = useUserSession()

// 상태 관리
const projectId = ref(null)
const isSaving = ref(false)
const isSubmitting = ref(false)
const saveStatus = ref('') // '' | 'saved' | 'error'
const isPreviewMode = ref(false)
const isDragging = ref(false)

// 폼 데이터
const form = reactive({
  title: '',
  description: '',
  difficulty: '',
  technology: [],
  hardware: [],
  content: '',
  locale: locale.value || 'uz',
})

const techOptions = ['Entry', 'Python', 'Robototexnika', 'AI & Data', '3D & CAD']
const hardwareOptions = ['Elektronika', 'Arduino Uno', 'Raspberry Pi Pico', 'ESP32-S3']
const difficultyOptions = ['1-daraja', '2-daraja', '3-daraja']

// 내 프로젝트 목록
const { data: myProjects, refresh: refreshProjects } = await useFetch('/api/projects/my', {
  lazy: true,
  server: false
})

// 하드웨어 섹션 노출 여부 (로보틱스 선택 시)
const showHardware = computed(() => form.technology.includes('Robototexnika'))

// 기술 분류 변경 감시 (로보틱스 해제 시 하드웨어 초기화)
watch(() => form.technology, (newVal) => {
  if (!newVal.includes('Robototexnika')) {
    form.hardware = []
  }
})

// 자동 저장 (3초 디바운스)
let autoSaveTimer = null
watch(() => ({ ...form }), () => {
  if (!form.title.trim()) return
  clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => saveDraft(true), 3000)
}, { deep: true })

async function saveDraft(isAuto = false) {
  if (!form.title.trim()) return
  isSaving.value = true
  saveStatus.value = ''

  try {
    const data = await $fetch('/api/projects/save', {
      method: 'POST',
      body: { ...form, projectId: projectId.value }
    })
    if (data.projectId && !projectId.value) {
      projectId.value = data.projectId
    }
    saveStatus.value = 'saved'
    if (!isAuto) await refreshProjects()
  } catch (e) {
    saveStatus.value = 'error'
  } finally {
    isSaving.value = false
  }
}

async function submitForReview() {
  if (!projectId.value) {
    await saveDraft()
  }
  if (!projectId.value) return

  isSubmitting.value = true
  try {
    await $fetch('/api/projects/submit', {
      method: 'POST',
      body: { projectId: projectId.value }
    })
    await refreshProjects()
    alert('심사 요청이 완료되었습니다! 관리자 검토 후 게시됩니다.')
    resetForm()
  } catch (e) {
    alert('제출 중 오류가 발생했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

function loadProject(project) {
  projectId.value = project.id
  const t = project.translations?.[0]
  if (t) {
    form.title = t.title || ''
    form.description = t.description || ''
    form.difficulty = t.difficulty || ''
    form.technology = JSON.parse(t.technology || '[]')
    form.hardware = JSON.parse(t.hardware || '[]')
    form.content = t.content || ''
    form.locale = t.locale || 'uz'
  }
}

async function deleteProject(id) {
  if (!confirm('이 프로젝트 초안을 삭제하시겠습니까?')) return
  
  try {
    await $fetch('/api/projects/delete', {
      method: 'POST',
      body: { projectId: id }
    })
    if (projectId.value === id) resetForm()
    await refreshProjects()
  } catch (e) {
    alert('삭제 중 오류가 발생했습니다.')
  }
}

function resetForm() {
  projectId.value = null
  Object.assign(form, {
    title: '', description: '', difficulty: '',
    technology: [], hardware: [], content: '', locale: locale.value || 'uz'
  })
  saveStatus.value = ''
}

// 이미지 업로드 처리
async function handleImageUpload(file) {
  if (!file || !file.type.startsWith('image/')) return

  const formData = new FormData()
  formData.append('image', file)

  try {
    const result = await $fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    })
    // 커서 위치에 이미지 Markdown 삽입
    const imageMarkdown = `\n![${file.name}](${result.url})\n`
    form.content += imageMarkdown
    saveStatus.value = ''
  } catch (e) {
    alert('이미지 업로드에 실패했습니다. 파일 크기(10MB 이하)를 확인해 주세요.')
  }
}

function onDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleImageUpload(file)
}

function onFileInput(e) {
  const file = e.target.files?.[0]
  if (file) handleImageUpload(file)
}

// 상태별 뱃지 스타일
const statusStyle = {
  draft:     'bg-gray-100 text-gray-600',
  review:    'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
}
const statusLabel = {
  draft:     '초안',
  review:    '심사 중',
  published: '게시됨',
  rejected:  '반려됨',
}

// 도구모음 아이템 정의
const toolbarItems = [
  { label: 'H2', insert: '## ', title: '섹션 제목' },
  { label: 'B', insert: '**굵게**', title: '굵게' },
  { label: '`', insert: '`코드`', title: '인라인 코드' },
  { label: '📋', insert: '\n::ProjectTask\n할 일을 입력하세요.\n::\n', title: 'Task 블록' },
  { label: '💡', insert: '\n::ProjectAlert{type="info"}\n# 제목\n내용을 입력하세요.\n::\n', title: 'Info 알림' },
  { label: '⚠️', insert: '\n::ProjectAlert{type="warning"}\n# 제목\n내용을 입력하세요.\n::\n', title: '경고 알림' },
  { label: '❓', insert: '\n::QuizBox\n---\nquestion: "질문을 입력하세요?"\noptions: ["선택지1", "선택지2", "선택지3"]\nanswer: "선택지1"\n---\n::\n', title: '퀴즈 블록' },
]

// 미리보기용 간단 Markdown 렌더링
function renderMarkdownPreview(md) {
  if (!md) return ''
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-black mt-6 mb-3 border-b-2 border-gray-100 pb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black mt-4 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^(?!<[h|l|p])(.+)$/gm, '<p class="mb-3 text-gray-700">$1</p>')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink :to="localePath('/projects')" class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </NuxtLink>
          <div class="min-w-0">
            <h1 class="text-sm sm:text-base font-black text-gray-900 truncate">
              {{ projectId ? '✏️ 이어 작성 중' : '✍️ 새 프로젝트 작성' }}
            </h1>
            <p v-if="projectId" class="text-[10px] text-gray-400 font-mono truncate">{{ form.title || '제목 없음' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <!-- 저장 상태 표시 -->
          <div class="flex items-center gap-1.5 text-xs">
            <svg v-if="isSaving" class="w-3.5 h-3.5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            <span v-if="saveStatus === 'saved'" class="text-green-600 font-semibold flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              저장됨
            </span>
            <span v-else-if="saveStatus === 'error'" class="text-red-500 font-semibold">저장 실패</span>
            <span v-else-if="isSaving" class="text-gray-400 hidden sm:block">저장 중...</span>
          </div>

          <!-- 미리보기 토글 -->
          <button @click="isPreviewMode = !isPreviewMode"
            class="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg border transition-all"
            :class="isPreviewMode ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'">
            {{ isPreviewMode ? '✏️ 편집' : '👁 미리보기' }}
          </button>

          <button @click="submitForReview"
            :disabled="isSubmitting || !form.title.trim() || !form.content.trim()"
            class="px-3 sm:px-5 py-1.5 text-xs sm:text-sm font-black rounded-lg bg-green-600 hover:bg-green-500 text-white shadow-md disabled:opacity-40 transition-all active:scale-95">
            🚀 심사 요청
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">

      <!-- 좌측: 내 프로젝트 목록 (데스크탑) -->
      <aside class="w-64 flex-shrink-0 hidden lg:block">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-xs font-black uppercase text-gray-500 tracking-widest">내 초안 목록</h3>
            <button @click="resetForm" class="text-xs text-green-600 font-bold hover:underline">+ 새 글</button>
          </div>
          <p class="text-[10px] text-gray-400 mb-4">클릭하면 이어서 작성할 수 있어요</p>
          <div class="space-y-2">
            <div v-if="!myProjects?.length" class="text-xs text-gray-400 text-center py-6">
              <div class="text-2xl mb-2">📭</div>
              아직 작성한 프로젝트가 없어요.
            </div>
            <div v-for="p in myProjects" :key="p.id"
              class="w-full text-left p-3 rounded-xl transition-all group border relative cursor-pointer"
              :class="projectId === p.id ? 'bg-green-50 border-green-300 shadow-sm' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'"
              @click="loadProject(p)"
              @keydown.enter="loadProject(p)"
              role="button"
              tabindex="0">
              <div class="flex items-start justify-between gap-1 mb-1 pr-5">
                <p class="text-xs font-bold text-gray-800 leading-tight line-clamp-2 flex-1">
                  {{ p.translations?.[0]?.title || '(제목 없음)' }}
                </p>
                <span class="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                  :class="statusStyle[p.status] || 'bg-gray-100 text-gray-500'">
                  {{ statusLabel[p.status] || p.status }}
                </span>
              </div>
              <p class="text-[10px] text-gray-400">{{ new Date(p.updatedAt).toLocaleDateString('ko-KR') }}</p>
              
              <!-- 삭제 버튼 -->
              <button @click.stop="deleteProject(p.id)" 
                class="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- 메인: 에디터 -->
      <main class="flex-1 min-w-0 space-y-4">

        <!-- 모바일 전용: 초안 선택 드로어 -->
        <div v-if="myProjects?.length" class="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-black uppercase text-gray-500 tracking-widest">📂 내 초안 — 이어서 작성하기</h3>
            <button @click="resetForm" class="text-xs text-green-600 font-bold">+ 새 글</button>
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1">
            <div v-for="p in myProjects" :key="p.id" class="relative flex-shrink-0">
              <button
                @click="loadProject(p)"
                class="text-left px-3 py-2 rounded-xl border text-xs transition-all h-full"
                :class="projectId === p.id ? 'bg-green-50 border-green-300 font-bold text-green-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'">
                <div class="font-bold truncate max-w-[120px]">{{ p.translations?.[0]?.title || '(제목 없음)' }}</div>
                <span class="text-[9px] font-black px-1 py-0.5 rounded mt-1 inline-block"
                  :class="statusStyle[p.status]">{{ statusLabel[p.status] }}</span>
              </button>
              <button @click.stop="deleteProject(p.id)" 
                class="absolute -top-1 -right-1 bg-white border border-gray-200 rounded-full p-0.5 text-gray-400 hover:text-red-500 shadow-sm">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-sm font-black uppercase text-gray-400 tracking-widest mb-5">📋 프로젝트 기본 정보</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- 제목 -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">제목 *</label>
              <input v-model="form.title" type="text" placeholder="프로젝트 제목을 입력하세요"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all placeholder-gray-300">
            </div>
            <!-- 설명 -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">설명</label>
              <textarea v-model="form.description" rows="2" placeholder="프로젝트를 한 문장으로 설명해 주세요"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all resize-none placeholder-gray-300 text-sm"></textarea>
            </div>
            <!-- 난이도 -->
            <div>
              <label class="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">난이도</label>
              <select v-model="form.difficulty"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-sm bg-white">
                <option value="">선택하세요</option>
                <option v-for="d in difficultyOptions" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <!-- 언어 -->
            <div>
              <label class="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">작성 언어</label>
              <select v-model="form.locale"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-sm bg-white">
                <option value="uz">🇺🇿 Uzbek</option>
                <option value="ko">🇰🇷 한국어</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>
            <!-- 기술 분류 -->
            <div>
              <label class="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">기술 분류</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="opt in techOptions" :key="opt"
                  class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full border text-xs font-bold transition-all"
                  :class="form.technology.includes(opt) ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'">
                  <input type="checkbox" :value="opt" v-model="form.technology" class="hidden">
                  {{ opt }}
                </label>
              </div>
            </div>
            <!-- 하드웨어 분류 (조건부 노출) -->
            <div v-if="showHardware">
              <label class="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">하드웨어</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="opt in hardwareOptions" :key="opt"
                  class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full border text-xs font-bold transition-all"
                  :class="form.hardware.includes(opt) ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'">
                  <input type="checkbox" :value="opt" v-model="form.hardware" class="hidden">
                  {{ opt }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 이미지 업로드 영역 -->
        <div
          class="bg-white rounded-2xl shadow-sm border-2 border-dashed transition-all p-4 flex items-center gap-4"
          :class="isDragging ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop="onDrop">
          <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl">🖼️</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-600">이미지를 드래그하거나 <label class="text-green-600 cursor-pointer hover:underline">파일 선택<input type="file" accept="image/*" class="hidden" @change="onFileInput"></label></p>
            <p class="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP, GIF · 최대 10MB · 자동으로 WebP로 변환됩니다</p>
          </div>
          <div v-if="isDragging" class="text-green-500 font-black text-sm">드롭하세요!</div>
        </div>

        <!-- Markdown 에디터 / 미리보기 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- 탭 헤더 -->
          <div class="flex items-center justify-between border-b border-gray-100 px-6 py-3 bg-gray-50">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase text-gray-500 tracking-widest">📝 본문 (Markdown)</span>
              <a href="https://www.markdownguide.org/basic-syntax/" target="_blank"
                class="text-[10px] text-gray-400 hover:text-gray-600 underline">문법 가이드</a>
            </div>
            <div class="text-xs text-gray-400">{{ form.content.length }}자</div>
          </div>

          <!-- 에디터 -->
          <div v-if="!isPreviewMode" class="relative">
            <!-- 빠른 도구모음 -->
            <div class="flex items-center gap-1 px-4 py-2 border-b border-gray-50 bg-gray-50/50 flex-wrap">
              <button v-for="(item, i) in toolbarItems" :key="i"
                @click="form.content += item.insert"
                :title="item.title"
                class="px-2 py-1 text-xs font-bold rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all">
                {{ item.label }}
              </button>
            </div>
            <textarea
              v-model="form.content"
              rows="24"
              placeholder="여기에 프로젝트 내용을 Markdown으로 작성하세요...

# 프로젝트 소개

## 준비물

::ProjectTask
할 일 작성
::

## 단계별 설명

```python
# 코드 예시
print('Hello World!')
```"
              class="w-full px-6 py-5 text-sm font-mono leading-relaxed focus:outline-none resize-none text-gray-800 placeholder-gray-300 bg-white"
              style="min-height: 520px;">
            </textarea>
          </div>

          <!-- 미리보기 -->
          <div v-else class="p-6 sm:p-10 prose prose-lg prose-green max-w-none min-h-[520px]"
            v-html="renderMarkdownPreview(form.content)">
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="flex justify-between items-center pb-8">
          <button @click="saveDraft()"
            :disabled="isSaving || !form.title.trim()"
            class="px-5 py-3 font-bold rounded-2xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all text-sm">
            {{ isSaving ? '저장 중...' : '💾 저장' }}
          </button>
          <button @click="submitForReview"
            :disabled="isSubmitting || !form.title.trim() || !form.content.trim()"
            class="px-6 py-3 font-black rounded-2xl bg-green-600 hover:bg-green-500 text-white shadow-xl disabled:opacity-40 transition-all active:scale-95 text-sm">
            {{ isSubmitting ? '제출 중...' : '🚀 심사 요청하기' }}
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
textarea {
  tab-size: 2;
}
</style>
