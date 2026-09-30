<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ScryfallPrinting } from '@/domain/card'
import { cardLanguageCodes } from '@/i18n'
import BaseSelect from './ui/BaseSelect.vue'

const props = defineProps<{
  printings: ScryfallPrinting[]
  selectedPrintingId: string
  language: string
}>()

const emit = defineEmits<{
  'update:selectedPrintingId': [value: string]
  'update:language': [value: string]
}>()

const { t } = useI18n()
const languageOptions = computed(() =>
  cardLanguageCodes.map((value) => ({
    value,
    label: t(`cardLanguages.${value}`),
  })),
)

const selectedPrinting = () =>
  props.printings.find((printing) => printing.id === props.selectedPrintingId)

const isLanguageFallback = () =>
  selectedPrinting()?.language !== undefined &&
  selectedPrinting()?.language !== props.language

const selectPrinting = (printingId: string) => {
  const printing = props.printings.find(
    (candidate) => candidate.id === printingId,
  )
  emit('update:selectedPrintingId', printingId)
  if (printing) {
    emit('update:language', printing.language)
  }
}
</script>

<template>
  <div
    class="result-card"
    :class="{ 'result-card--empty': !selectedPrinting() }"
  >
    <img
      v-if="selectedPrinting()"
      :src="selectedPrinting()?.imageUri"
      :alt="selectedPrinting()?.name"
    />
    <div class="result-card__details">
      <template v-if="selectedPrinting()">
        <p class="eyebrow">{{ t('result.selectedEdition') }}</p>
        <h3>{{ selectedPrinting()?.setName }}</h3>
        <p>
          {{ selectedPrinting()?.setCode.toUpperCase() }} ·
          {{ selectedPrinting()?.collectorNumber }}
        </p>
        <p v-if="isLanguageFallback()" class="language-fallback">
          {{
            t('result.languageFallback', {
              requested: t(`cardLanguages.${language}`),
              fallback: t(`cardLanguages.${selectedPrinting()?.language}`),
            })
          }}
        </p>
      </template>
      <p v-else class="inline-error">
        {{
          t('result.languageUnavailable', {
            language: t(`cardLanguages.${language}`),
          })
        }}
      </p>
      <BaseSelect
        :model-value="selectedPrintingId"
        :label="t('result.printing')"
        :options="
          printings.map((printing) => ({
            value: printing.id,
            label: `${printing.setName} · ${printing.collectorNumber}`,
          }))
        "
        @update:model-value="selectPrinting($event)"
      />
      <BaseSelect
        :model-value="language"
        :label="t('language.card')"
        :options="languageOptions"
        @update:model-value="emit('update:language', $event)"
      />
    </div>
  </div>
</template>
