import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import App from '@/App.vue'
import { WORKSPACE_STORAGE_KEY } from '@/services/workspace-storage'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the proxy printer workspace', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Improxy.')
    expect(wrapper.text()).toContain('Caos (des)controlado.')
    expect(wrapper.text()).toContain('Pon las cartas sobre la mesa')
    expect(wrapper.text()).toContain('Añade tus cartas')
    expect(wrapper.text()).toContain('Elige edición')
    expect(wrapper.text()).toContain('Calienta rodillos')
    expect(wrapper.text()).toContain('01')
    expect(wrapper.text()).toContain('03')
    expect(wrapper.text()).not.toContain('04 /')
    wrapper.unmount()
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
    wrapper.unmount()
  })

  it('reports incompatible saved data and lets the user clear it', async () => {
    window.localStorage.setItem(
      WORKSPACE_STORAGE_KEY,
      JSON.stringify({ version: 2, workspace: {} }),
    )
    const wrapper = mount(App)

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'versión incompatible',
    )
    await wrapper.find('button.button--danger').trigger('click')
    await flushPromises()

    expect(window.localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('announces when workspace changes cannot be saved', async () => {
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
    const wrapper = mount(App)

    await wrapper.get('textarea').setValue('Lightning Bolt')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'No se pudieron guardar los últimos cambios',
    )
    wrapper.unmount()
    setItem.mockRestore()
  })
})
