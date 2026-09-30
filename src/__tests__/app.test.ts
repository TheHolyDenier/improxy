import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import App from '@/App.vue'

describe('App', () => {
  it('renders the proxy printer workspace', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Improxy.')
    expect(wrapper.text()).toContain('Caos (des)controlado.')
    expect(wrapper.text()).toContain('Pon las cartas sobre la mesa')
    expect(wrapper.text()).toContain('Añade tus cartas')
    expect(wrapper.text()).toContain('Elige idioma y edición')
    expect(wrapper.text()).toContain('Calienta rodillos')
    expect(wrapper.text()).toContain('01')
    expect(wrapper.text()).toContain('03')
    expect(wrapper.text()).not.toContain('04 /')
  })

  it('places quick add before the card list with the action after the input', () => {
    const wrapper = mount(App)
    const quickAdd = wrapper.find('.app__quick-add')

    expect(quickAdd.exists()).toBe(true)
    expect(quickAdd.find('input').exists()).toBe(true)
    expect(quickAdd.find('button').text()).toBe('Añadir carta')
    expect(
      quickAdd.element.compareDocumentPosition(
        wrapper.find('.app__empty-state').element,
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
