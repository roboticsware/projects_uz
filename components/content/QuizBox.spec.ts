import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizBox from './QuizBox.vue'

describe('QuizBox Component', () => {
  it('renders the question correctly', () => {
    const wrapper = mount(QuizBox, {
      props: {
        question: 'What color is the sky?',
        options: ['Blue', 'Red', 'Green'],
        answer: 'Blue'
      }
    })
    
    expect(wrapper.text()).toContain('What color is the sky?')
  })

  it('shows correct message when right answer is clicked', async () => {
    const wrapper = mount(QuizBox, {
      props: {
        question: 'What color is the sky?',
        options: ['Blue', 'Red', 'Green'],
        answer: 'Blue'
      }
    })
    
    // Find all buttons and click the first one (Blue)
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    
    expect(wrapper.text()).toContain('Correct!')
    expect(wrapper.classes()).not.toContain('text-red-600')
  })
})
