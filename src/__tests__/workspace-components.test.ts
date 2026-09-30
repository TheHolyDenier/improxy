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
  sourceLine: 1,
  name: 'Lightning Bolt',
  queryName: 'Lightning Bolt',
  quantity: 1,
  setCode: '',
  collectorNumber: '',
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

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Añadir cartas')
      ?.trigger('click')

    expect(wrapper.emitted('import')).toHaveLength(1)
  })

  it('shows import errors as a floating notification and dismisses them', async () => {
    vi.useFakeTimers()
    const wrapper = mount(CardListInput, {
      props: {
        modelValue: '',
        errorMessages: ['Carta 1: Falta información.'],
      },
      attachTo: document.body,
    })

    expect(
      document.body.querySelector('[role="alert"]')?.textContent,
    ).toContain('Carta 1: Falta información.')

    vi.advanceTimersByTime(60_000)
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('[role="alert"]')).toBeNull()
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('shows only the latest import error in the floating notification', () => {
    const wrapper = mount(CardListInput, {
      props: {
        modelValue: '',
        errorMessages: [
          'No hemos encontrado ninguna carta llamada «patata».',
          'No hemos encontrado ninguna carta llamada «patata».',
          'No hemos encontrado ninguna carta llamada «carta».',
        ],
      },
      attachTo: document.body,
    })

    const alert = document.body.querySelector('[role="alert"]')
    expect(alert?.textContent).toContain('«carta»')
    expect(alert?.textContent).not.toContain('«patata»')
    wrapper.unmount()
  })

  it('renders a read-only row and emits removal', async () => {
    const wrapper = mount(CardRowEditor, { props: { row } })

    expect(wrapper.text()).toContain('Nombre')
    expect(wrapper.text()).toContain('Cantidad')
    expect(wrapper.text()).not.toContain('Edición')
    expect(wrapper.text()).not.toContain('N.º de carta')
    expect(wrapper.find('.row-number').exists()).toBe(false)

    await wrapper.find('button.button--danger').trigger('click')

    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('displays the resolved Scryfall name instead of the entered name', () => {
    const wrapper = mount(CardRowEditor, {
      props: {
        row: {
          ...row,
          name: 'Counterspell',
          queryName: 'contrahechizo',
          printings: [
            { ...printing, name: 'Counterspell' },
            {
              ...printing,
              id: 'printing-es',
              language: 'es',
              name: 'Contrahechizo',
            },
          ],
          selectedPrintingId: 'printing-es',
        },
      },
    })

    expect(wrapper.text()).toContain('Counterspell')
    expect(wrapper.text()).not.toContain('contrahechizo')
  })

  it('does not show a separate name skeleton while resolving', () => {
    const wrapper = mount(CardRowEditor, {
      props: {
        row: {
          ...row,
          name: '',
          queryName: 'contrahechizo',
          status: 'loading',
          printings: [],
          selectedPrintingId: '',
        },
      },
    })

    expect(wrapper.find('.row-editor__skeleton').exists()).toBe(false)
    expect(wrapper.text()).toContain('—')
  })

  it('renders quantity controls without search or duplicate actions', async () => {
    const wrapper = mount(CardRowEditor, { props: { row } })
    expect(wrapper.find('button[aria-label="Buscar"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Duplicar"]').exists()).toBe(false)

    const increase = wrapper.find('button[aria-label="Aumentar cantidad"]')
    await increase.trigger('click')

    expect(wrapper.emitted('update')?.at(-1)).toEqual([{ quantity: 2 }])
  })

  it('shows resolution errors in the result card', () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [],
        selectedPrintingId: '',
        language: 'es',
        status: 'error',
        errorMessage: 'No encontramos esa carta en Scryfall.',
      },
    })

    expect(wrapper.text()).toContain('No encontramos esa carta en Scryfall.')
  })

  it('renders printing metadata', () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing],
        selectedPrintingId: printing.id,
        language: 'en',
        status: 'resolved',
        errorMessage: '',
      },
    })

    expect(wrapper.text()).toContain('Limited Edition Alpha')
  })

  it('exposes printing and language selectors in the result card', () => {
    const spanishPrinting = { ...printing, id: 'printing-es', language: 'es' }
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing, spanishPrinting],
        selectedPrintingId: printing.id,
        language: 'es',
        status: 'resolved',
        errorMessage: '',
      },
    })

    expect(wrapper.findAll('select')).toHaveLength(2)
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('marks an English fallback when Spanish is unavailable', () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing],
        selectedPrintingId: printing.id,
        language: 'es',
        status: 'resolved',
        errorMessage: '',
      },
    })

    expect(wrapper.text()).toContain('No hay una impresión en español')
  })

  it('keeps resolved card identity read-only', () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing],
        selectedPrintingId: printing.id,
        language: 'en',
        status: 'resolved',
        errorMessage: '',
      },
    })

    expect(wrapper.text()).toContain('Limited Edition Alpha')
    expect(wrapper.findAll('select')).toHaveLength(2)
    expect(wrapper.findAll('input')).toHaveLength(0)
  })

  it('renders global language controls', () => {
    const wrapper = mount(LanguageControls, { props: { modelValue: 'en' } })

    expect(wrapper.find('select').attributes('aria-label')).toBe('Idioma')
    expect(wrapper.find('option').text()).toBe('EN')
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

    expect(wrapper.text()).toContain('1 proxy listo')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('print')).toHaveLength(1)
  })

  it('renders nine print slots for one page', () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: { pages: [{ copies: [{ rowId: row.id, printing }] }] },
    })

    expect(wrapper.findAll('.print-preview__slot')).toHaveLength(9)
  })

  it('renders and emits the ink-saving preference', async () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: {
        pages: [{ copies: [{ rowId: row.id, printing }] }],
        inkSaving: false,
      },
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.attributes('aria-label')).toBe('Ahorro de tinta')
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

    expect(wrapper.find('.print-preview__pages').classes()).toContain(
      'print-preview__pages--ink-saving',
    )
    expect(wrapper.find('.print-preview__image').exists()).toBe(true)
    expect(wrapper.findAll('.print-preview__slot')).toHaveLength(9)
  })

  it('restores original image URLs when ink saving is disabled', async () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: {
        pages: [{ copies: [{ rowId: row.id, printing }] }],
        inkSaving: true,
      },
    })

    await flushPromises()
    expect(wrapper.find('.print-preview__image').attributes('src')).toBe(
      'data:image/png;base64,processed',
    )

    await wrapper.setProps({ inkSaving: false })

    expect(wrapper.find('.print-preview__image').attributes('src')).toBe(
      printing.imageUri,
    )
  })

  it('shows a floating button to return to the top', async () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    })
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(ScrollToTopButton, { props: { enabled: true } })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 })
    window.dispatchEvent(new Event('scroll'))

    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').attributes('aria-label')).toBe(
      'Subir al inicio',
    )
    await wrapper.find('button').trigger('click')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    scrollTo.mockRestore()
  })

  it('hides the back-to-top button until enough rows exist', async () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 500,
    })
    const wrapper = mount(ScrollToTopButton, { props: { enabled: false } })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('keeps floating navigation available through the proxy preview', async () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 500,
    })

    const wrapper = mount(ScrollToTopButton, { props: { enabled: true } })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').exists()).toBe(true)

    wrapper.unmount()
  })
})
