import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import CardListInput from '@/components/CardListInput.vue'
import CardResultCard from '@/components/CardResultCard.vue'
import CardRowEditor from '@/components/CardRowEditor.vue'
import LanguageControls from '@/components/LanguageControls.vue'
import ProxyPrintPreview from '@/components/ProxyPrintPreview.vue'
import ReadinessSummary from '@/components/ReadinessSummary.vue'
import type { CardRowState } from '@/domain/card'

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

    await wrapper.find('button.base-button--danger').trigger('click')

    expect(wrapper.emitted('remove')).toHaveLength(1)
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
})
