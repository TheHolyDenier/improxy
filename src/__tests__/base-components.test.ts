import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'

describe('base components', () => {
  it('renders a button with its slot', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Guardar' } })

    expect(wrapper.text()).toContain('Guardar')
    expect(wrapper.find('button').attributes('type')).toBe('button')
  })

  it('renders card content', () => {
    const wrapper = mount(BaseCard, { slots: { default: 'Contenido' } })

    expect(wrapper.text()).toBe('Contenido')
  })

  it('emits input updates', async () => {
    const wrapper = mount(BaseInput, {
      props: { label: 'Nombre', modelValue: '' },
    })

    await wrapper.find('input').setValue('Bolt')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Bolt'])
  })

  it('renders select options and emits selection', async () => {
    const wrapper = mount(BaseSelect, {
      props: {
        label: 'Idioma',
        modelValue: 'en',
        options: [{ value: 'en', label: 'Inglés' }],
      },
    })

    await wrapper.find('select').setValue('en')

    expect(wrapper.find('option').text()).toBe('Inglés')
  })

  it('emits textarea updates', async () => {
    const wrapper = mount(BaseTextarea, {
      props: { label: 'Lista', modelValue: '' },
    })

    await wrapper.find('textarea').setValue('Lightning Bolt')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
      'Lightning Bolt',
    ])
  })
})
