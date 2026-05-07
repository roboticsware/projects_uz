import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import QuizBox from '../components/content/QuizBox.vue'

// Mocking Nuxt & i18n
vi.stubGlobal('useI18n', () => ({
  t: (key: string) => key
}))

// Make useState reactive for testing
const stateMap = new Map()
vi.stubGlobal('useState', (key: string, init: any) => {
  if (!stateMap.has(key)) {
    stateMap.set(key, ref(init()))
  }
  return stateMap.get(key)
})

vi.stubGlobal('useRoute', () => ({
  path: '/test-project'
}))

describe('QuizBox.vue', () => {
  const mountOptions = {
    global: {
      mocks: {
        $t: (key: string, params?: any) => {
          if (params?.n !== undefined) return `${key}:${params.n}`
          return key
        }
      }
    }
  }

  it('should lock after 5 incorrect attempts', async () => {
    // Clear state before test
    stateMap.clear()
    
    const wrapper = mount(QuizBox, {
      ...mountOptions,
      props: {
        question: 'Test Question',
        options: ['A', 'B', 'C'],
        answer: 'A'
      }
    })

    // Simulate 5 wrong answers
    for (let i = 0; i < 5; i++) {
      const buttons = wrapper.findAll('button')
      const optionB = buttons.find(b => b.text().includes('B'))
      await optionB?.trigger('click')
    }

    // Check if locked
    expect(wrapper.text()).toContain('quiz.locked')
    const buttons = wrapper.findAll('button')
    // Option buttons should be disabled
    buttons.forEach(button => {
      expect(button.element.disabled).toBe(true)
    })
  })

  it('should show success message on correct answer', async () => {
    stateMap.clear()
    
    const wrapper = mount(QuizBox, {
      ...mountOptions,
      props: {
        question: 'Test Question',
        options: ['A', 'B', 'C'],
        answer: 'A'
      }
    })

    const buttons = wrapper.findAll('button')
    const optionA = buttons.find(b => b.text().includes('A'))
    await optionA?.trigger('click')

    expect(wrapper.text()).toContain('quiz.correct')
  })
})
