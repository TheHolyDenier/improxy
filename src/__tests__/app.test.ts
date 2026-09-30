import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import App from '@/App.vue'

describe('App', () => {
  it('renders the proxy printer workspace', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Improxy.')
    expect(wrapper.text()).toContain('Caos (des)controlado.')
    expect(wrapper.text()).toContain('Pega tu lista')
  })
})
