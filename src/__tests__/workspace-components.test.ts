import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import CardListInput from '@/components/CardListInput.vue'
import CardResultCard from '@/components/CardResultCard.vue'
import CardRowEditor from '@/components/CardRowEditor.vue'
import LanguageControls from '@/components/LanguageControls.vue'
import ProxyPrintPreview from '@/components/ProxyPrintPreview.vue'
import ReadinessSummary from '@/components/ReadinessSummary.vue'
import ScrollToTopButton from '@/components/ScrollToTopButton.vue'
import type { CardRowState } from '@/domain/card'

vi.mock('@/services/ink-saving-image', () => ({
  createInkSavingImageUri: vi
    .fn()
    .mockResolvedValue('data:image/png;base64,processed'),
}))

const printing = {
  id: 'printing-1',
  name: 'Lightning Bolt',
  setCode: 'lea',
  setName: 'Limited Edition Alpha',
  collectorNumber: '161',
  language: 'en',
  imageUri: 'https://example.com/card.jpg',
}

const row: CardRowState = {
  id: 'row-1',
  name: 'Lightning Bolt',
  quantity: 1,
  setCode: '',
  status: 'resolved',
  errorMessage: '',
  printings: [printing],
  selectedPrintingId: printing.id,
  languageOverride: '',
}

describe('workspace components', () => {
  it('renders the card list input and emits import', async () => {
    const wrapper = mount(CardListInput, {
      props: { modelValue: '', errorMessages: [] },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('import')).toHaveLength(1)
  })

  it('renders an editable row and emits removal', async () => {
    const wrapper = mount(CardRowEditor, { props: { row } })

    expect(wrapper.text()).toContain('Nombre')
    expect(wrapper.text()).toContain('Cantidad')
    expect(wrapper.text()).toContain('Set opcional')
    expect(wrapper.text()).toContain('1 edición')
    expect(wrapper.text()).not.toContain('1 ediciones')
    expect(wrapper.find('.row-number').exists()).toBe(false)

    await wrapper.find('button.base-button--danger').trigger('click')

    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('searches a row without emitting a duplicate action', async () => {
    const wrapper = mount(CardRowEditor, { props: { row } })
    const searchButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Buscar')
    if (!searchButton) {
      throw new Error('Search button was not rendered')
    }

    await searchButton.trigger('click')

    expect(wrapper.emitted('search')).toHaveLength(1)
    expect(wrapper.emitted('duplicate')).toBeUndefined()
  })

  it('renders printing metadata', () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing],
        selectedPrintingId: printing.id,
        language: 'en',
      },
    })

    expect(wrapper.text()).toContain('Limited Edition Alpha')
  })

  it('groups language variants into one edition option', () => {
    const spanishPrinting = { ...printing, id: 'printing-es', language: 'es' }
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing, spanishPrinting],
        selectedPrintingId: printing.id,
        language: 'es',
      },
    })

    expect(wrapper.findAll('select')[0]?.findAll('option')).toHaveLength(1)
  })

  it('marks an English fallback when Spanish is unavailable', () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing],
        selectedPrintingId: printing.id,
        language: 'es',
      },
    })

    expect(wrapper.text()).toContain('No hay una impresión en Español')
  })

  it('changes the printing without changing the language preference', async () => {
    const secondPrinting = {
      ...printing,
      id: 'printing-2',
      setCode: 'frc',
      setName: 'Reality Fracture Commander',
      collectorNumber: '25',
    }
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing, secondPrinting],
        selectedPrintingId: printing.id,
        language: 'en',
      },
    })

    await wrapper.find('select').setValue('frc:25')

    expect(wrapper.emitted('update:language')).toBeUndefined()
    expect(wrapper.emitted('update:selectedPrintingId')?.[0]).toEqual([
      secondPrinting.id,
    ])
  })

  it('renders global language controls', () => {
    const wrapper = mount(LanguageControls, { props: { modelValue: 'en' } })

    expect(wrapper.find('label').text()).toContain('Idioma global')
  })

  it('emits a global language change', async () => {
    const wrapper = mount(LanguageControls, { props: { modelValue: 'en' } })

    await wrapper.find('select').setValue('es')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['es'])
  })

  it('renders a readiness summary and emits print', async () => {
    const wrapper = mount(ReadinessSummary, {
      props: { totalCopies: 1, unresolvedCount: 0, ready: true },
    })

    expect(wrapper.text()).toContain('1 proxies preparados')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('print')).toHaveLength(1)
  })

  it('renders nine print slots for one page', () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: { pages: [{ copies: [{ rowId: row.id, printing }] }] },
    })

    expect(wrapper.findAll('.print-slot')).toHaveLength(9)
  })

  it('renders and emits the ink-saving preference', async () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: {
        pages: [{ copies: [{ rowId: row.id, printing }] }],
        inkSaving: false,
      },
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.attributes('aria-label')).toBe(
      'Filtro texto / ahorrar tinta',
    )
    await checkbox.setValue(true)

    expect(wrapper.emitted('update:inkSaving')?.[0]).toEqual([true])
  })

  it('marks the printable region without changing its slot count', () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: {
        pages: [{ copies: [{ rowId: row.id, printing }] }],
        inkSaving: true,
      },
    })

    expect(wrapper.find('.print-pages').classes()).toContain(
      'print-pages--ink-saving',
    )
    expect(wrapper.find('.print-slot__image').exists()).toBe(true)
    expect(wrapper.findAll('.print-slot')).toHaveLength(9)
  })

  it('restores original image URLs when ink saving is disabled', async () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: {
        pages: [{ copies: [{ rowId: row.id, printing }] }],
        inkSaving: true,
      },
    })

    await flushPromises()
    expect(wrapper.find('.print-slot__image').attributes('src')).toBe(
      'data:image/png;base64,processed',
    )

    await wrapper.setProps({ inkSaving: false })

    expect(wrapper.find('.print-slot__image').attributes('src')).toBe(
      printing.imageUri,
    )
  })

  it('shows a floating button to return to the top', async () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    })
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(ScrollToTopButton)
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 })
    window.dispatchEvent(new Event('scroll'))

    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Volver arriba')
    await wrapper.find('button').trigger('click')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    scrollTo.mockRestore()
  })

  it('keeps floating navigation available through the proxy preview', async () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 500,
    })

    const wrapper = mount(ScrollToTopButton)

    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').exists()).toBe(true)

    wrapper.unmount()
  })
})
