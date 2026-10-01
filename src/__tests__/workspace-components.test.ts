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
  loadedLanguages: ['en'],
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

  it('disables list input controls while loading', () => {
    const wrapper = mount(CardListInput, {
      props: { modelValue: '', errorMessages: [], loading: true },
    })

    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Cargando…')
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

  it('shows all distinct import errors in the floating notification', () => {
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
    expect(alert?.textContent).toContain('«patata»')
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

  it('renders quantity controls without a search or duplicate action', async () => {
    const wrapper = mount(CardRowEditor, { props: { row } })
    expect(wrapper.find('button[aria-label="Buscar"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Duplicar carta"]').exists()).toBe(
      false,
    )

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

  it('keeps every language selectable and labels languages that need a search', async () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing],
        loadedLanguages: ['en', 'de'],
        selectedPrintingId: printing.id,
        language: 'en',
        status: 'resolved',
        errorMessage: '',
      },
    })
    const languageSelect = wrapper.find('.result-card__language-control select')
    const languageOptions = languageSelect.findAll('option')

    expect(languageOptions).toHaveLength(7)
    expect(languageOptions.map((option) => option.text())).toContain(
      'JA · buscar',
    )
    expect(languageOptions.map((option) => option.text())).toContain(
      'DE · no disponible',
    )

    await languageSelect.setValue('ja')

    expect(wrapper.emitted('update:language')?.[0]).toEqual(['ja'])
  })

  it('filters out editions without the requested language or English fallback', () => {
    const unrelatedPrinting = {
      ...printing,
      id: 'printing-ja-other-edition',
      setCode: 'neo',
      setName: 'Neon Dynasty',
      language: 'ja',
    }
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing, unrelatedPrinting],
        loadedLanguages: ['en', 'es'],
        selectedPrintingId: printing.id,
        language: 'es',
        status: 'resolved',
        errorMessage: '',
      },
    })
    const editionOptions = wrapper.findAll(
      '.result-card__printing-control option',
    )

    expect(editionOptions).toHaveLength(1)
    expect(editionOptions[0]?.text()).toContain('Limited Edition Alpha')
    expect(wrapper.text()).not.toContain('Neon Dynasty')
  })

  it('explains when no edition has the requested language or English fallback', () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [{ ...printing, language: 'ja' }],
        loadedLanguages: ['en', 'es'],
        selectedPrintingId: '',
        language: 'es',
        status: 'resolved',
        errorMessage: '',
      },
    })

    expect(wrapper.text()).toContain(
      'No hay una impresión disponible en español.',
    )
    expect(wrapper.find('.result-card__printing-control').exists()).toBe(false)
    expect(
      wrapper.findAll('.result-card__language-control option'),
    ).toHaveLength(7)
  })

  it('keeps language controls visible and announces a language search in progress', () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing],
        loadedLanguages: ['en'],
        selectedPrintingId: printing.id,
        language: 'de',
        status: 'loading',
        errorMessage: '',
      },
    })

    expect(wrapper.text()).toContain('Buscando…')
    expect(wrapper.findAll('select')).toHaveLength(2)
    expect(
      wrapper.find('.result-card__language-control option:checked').text(),
    ).toBe('DE · Buscando…')
  })

  it('offers a retry action after a language search error', async () => {
    const wrapper = mount(CardResultCard, {
      props: {
        printings: [printing],
        loadedLanguages: ['en'],
        selectedPrintingId: printing.id,
        language: 'de',
        status: 'resolved',
        errorMessage: 'No se pudo buscar.',
      },
    })

    await wrapper.find('.result-card__retry').trigger('click')

    expect(wrapper.emitted('retry-language-search')).toHaveLength(1)
  })

  it('forwards language search retries from the row editor', async () => {
    const wrapper = mount(CardRowEditor, {
      props: {
        row: { ...row, errorMessage: 'No se pudo buscar.' },
        language: 'de',
      },
    })

    await wrapper.find('.result-card__retry').trigger('click')

    expect(wrapper.emitted('retryLanguageSearch')).toHaveLength(1)
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
    expect(wrapper.findAll('select option')).toHaveLength(7)
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

  it('shows unresolved cards and disables print while loading', () => {
    const wrapper = mount(ReadinessSummary, {
      props: { totalCopies: 1, unresolvedCount: 2, ready: true, loading: true },
    })

    expect(wrapper.text()).toContain('2 cartas pendientes de resolver')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Preparando…')
  })

  it('renders nine print slots and the page position', () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: { pages: [{ copies: [{ rowId: row.id, printing }] }] },
    })

    expect(wrapper.findAll('.print-preview__slot')).toHaveLength(9)
    expect(wrapper.find('.print-preview__page-label').text()).toBe(
      'Página 1 de 1',
    )
  })

  it('shows the personal non-commercial proxy disclaimer', () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: { pages: [] },
    })

    expect(wrapper.text()).toContain('uso personal y sin ánimo de lucro')
    expect(wrapper.text()).toContain('Scryfall')
  })

  it('renders and emits the ink-saving preference', async () => {
    const wrapper = mount(ProxyPrintPreview, {
      props: {
        pages: [{ copies: [{ rowId: row.id, printing }] }],
        inkSaving: false,
      },
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.attributes('aria-label')).toBe('B/N')
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

  it('shows navigation buttons for the previous and next sections', async () => {
    const importSection = document.createElement('section')
    const workspaceSection = document.createElement('section')
    const previewSection = document.createElement('section')
    importSection.id = 'import'
    workspaceSection.id = 'workspace'
    previewSection.id = 'preview'
    Object.defineProperty(importSection, 'offsetTop', { value: 0 })
    Object.defineProperty(workspaceSection, 'offsetTop', { value: 500 })
    Object.defineProperty(previewSection, 'offsetTop', { value: 1000 })
    document.body.append(importSection, workspaceSection, previewSection)

    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    const wrapper = mount(ScrollToTopButton, {
      props: {
        enabled: true,
        sectionIds: ['import', 'workspace', 'preview'],
      },
    })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 })
    window.dispatchEvent(new Event('scroll'))

    await wrapper.vm.$nextTick()
    expect(wrapper.find('button[aria-label="Sección anterior"]').exists()).toBe(
      true,
    )
    expect(
      wrapper.find('button[aria-label="Sección siguiente"]').exists(),
    ).toBe(true)
    await wrapper
      .find('button[aria-label="Sección siguiente"]')
      .trigger('click')

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
    document.body.replaceChildren()
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

  it('shows only the next control at the first section', async () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    })
    const importSection = document.createElement('section')
    const workspaceSection = document.createElement('section')
    importSection.id = 'import'
    workspaceSection.id = 'workspace'
    Object.defineProperty(importSection, 'offsetTop', { value: 0 })
    Object.defineProperty(workspaceSection, 'offsetTop', { value: 500 })
    document.body.append(importSection, workspaceSection)

    const wrapper = mount(ScrollToTopButton, {
      props: { enabled: true, sectionIds: ['import', 'workspace'] },
    })

    await wrapper.vm.$nextTick()
    expect(
      wrapper.find('button[aria-label="Sección anterior"]').classes(),
    ).toContain('scroll-top-button--hidden')
    expect(
      wrapper.find('button[aria-label="Sección siguiente"]').exists(),
    ).toBe(true)

    wrapper.unmount()
    document.body.replaceChildren()
  })

  it('returns to the current section header before going to the previous one', async () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 1500,
    })
    const importSection = document.createElement('section')
    const workspaceSection = document.createElement('section')
    const previewSection = document.createElement('section')
    importSection.id = 'import'
    workspaceSection.id = 'workspace'
    previewSection.id = 'preview'
    Object.defineProperty(importSection, 'offsetTop', { value: 0 })
    Object.defineProperty(workspaceSection, 'offsetTop', { value: 500 })
    Object.defineProperty(previewSection, 'offsetTop', { value: 1000 })
    document.body.append(importSection, workspaceSection, previewSection)

    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    const wrapper = mount(ScrollToTopButton, {
      props: {
        enabled: true,
        sectionIds: ['import', 'workspace', 'preview'],
      },
    })

    await wrapper.vm.$nextTick()
    await wrapper.find('button[aria-label="Sección anterior"]').trigger('click')

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    )
    expect(scrollIntoView.mock.instances[0]).toBe(previewSection)

    wrapper.unmount()
    document.body.replaceChildren()
  })
})
