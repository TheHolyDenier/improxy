<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { RowStatus, ScryfallPrinting } from '@/domain/card'
import { cardLanguageCodes } from '@/i18n'
import BaseSelect from './ui/BaseSelect.vue'

const props = defineProps<{
  printings: ScryfallPrinting[]
  selectedPrintingId: string
  language: string
  status: RowStatus
  errorMessage: string
}>()

const emit = defineEmits<{
  'update:selectedPrintingId': [value: string]
  'update:language': [value: string]
}>()

const { t } = useI18n()
const selectedPrinting = computed(() =>
  props.printings.find((printing) => printing.id === props.selectedPrintingId),
)
const languageOptions = computed(() =>
  cardLanguageCodes.map((value) => ({
    value,
    label: value.toUpperCase(),
  })),
)
const printingGroups = computed(() => {
  const groups = new Map<
    string,
    { key: string; printings: ScryfallPrinting[] }
  >()

  props.printings.forEach((printing) => {
    const key = `${printing.setCode}:${printing.collectorNumber}`
    const group = groups.get(key)
    if (group) {
      group.printings.push(printing)
    } else {
      groups.set(key, { key, printings: [printing] })
    }
  })

  return [...groups.values()]
})
const selectedEditionKey = computed(() =>
  selectedPrinting.value
    ? `${selectedPrinting.value.setCode}:${selectedPrinting.value.collectorNumber}`
    : '',
)
const printingOptions = computed(() =>
  printingGroups.value.map((group) => {
    const printing = group.printings[0]
    return {
      value: group.key,
      label: `${printing?.setName} · ${printing?.collectorNumber}`,
    }
  }),
)

const isLanguageFallback = () =>
  selectedPrinting.value?.language !== undefined &&
  selectedPrinting.value.language !== props.language

function selectPrinting(editionKey: string) {
  const group = printingGroups.value.find(
    (candidate) => candidate.key === editionKey,
  )
  const printing =
    group?.printings.find(
      (candidate) => candidate.language === props.language,
    ) ??
    group?.printings.find((candidate) => candidate.language === 'en') ??
    group?.printings[0]

  if (printing) {
    emit('update:selectedPrintingId', printing.id)
  }
}
</script>

<template>
  <div v-if="status === 'loading'" class="result-card result-card--loading">
    <div class="result-card__skeleton result-card__skeleton--image" />
    <div class="result-card__details">
      <span class="result-card__skeleton result-card__skeleton--line" />
      <span class="result-card__skeleton result-card__skeleton--title" />
      <span class="result-card__skeleton result-card__skeleton--line" />
    </div>
  </div>
  <div
    v-else
    class="result-card"
    :class="{ 'result-card--empty': !selectedPrinting }"
  >
    <img
      v-if="selectedPrinting"
      class="result-card__image"
      :src="selectedPrinting.imageUri"
      :alt="selectedPrinting.name"
    />
    <div class="result-card__details">
      <p v-if="isLanguageFallback()" class="result-card__fallback">
        {{
          t('result.languageFallback', {
            requested: t(`cardLanguages.${language}`),
            fallback: t(`cardLanguages.${selectedPrinting?.language}`),
          })
        }}
      </p>
      <p v-if="status === 'error'" class="result-card__error">
        {{ errorMessage || t('result.empty') }}
      </p>
      <p v-else-if="!selectedPrinting" class="result-card__error">
        {{ t('result.empty') }}
      </p>
      <div v-if="printings.length" class="result-card__controls">
        <div class="result-card__printing-control">
          <BaseSelect
            :model-value="selectedEditionKey"
            :label="t('result.printing')"
            :options="printingOptions"
            @update:model-value="selectPrinting($event)"
          />
        </div>
        <div class="result-card__language-control">
          <BaseSelect
            :model-value="language"
            :label="t('language.card')"
            :options="languageOptions"
            @update:model-value="emit('update:language', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  display: flex;
  gap: 14px;
  padding: 14px;
  border-radius: 16px;
  background: #f7eefa;
}

.result-card__image {
  align-self: flex-start;
  flex: 0 0 auto;
  width: 96px;
  height: 134px;
  aspect-ratio: 63 / 88;
  border-radius: 8px;
  background: #fff;
  object-fit: contain;
  box-shadow: 0 8px 18px rgba(42, 20, 37, 0.2);
}

.result-card__details {
  display: grid;
  flex: 1;
  align-content: center;
  gap: 8px;
}

.result-card__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 70px;
  align-items: end;
  gap: 8px;
  margin-top: 4px;
}

.result-card__language-control {
  min-width: 0;
}

.result-card__skeleton {
  display: block;
  border-radius: 8px;
  background: linear-gradient(90deg, #eadcf1 25%, #f7eefa 50%, #eadcf1 75%);
  background-size: 200% 100%;
  animation: result-card-shimmer 1.2s ease-in-out infinite;
}

.result-card__skeleton--image {
  width: 96px;
  height: 134px;
}

.result-card__skeleton--line {
  width: 42%;
  height: 12px;
}

.result-card__skeleton--title {
  width: 72%;
  height: 24px;
}

@keyframes result-card-shimmer {
  to {
    background-position: -200% 0;
  }

  @media (max-width: 520px) {
    .result-card__controls {
      grid-template-columns: 1fr;
    }
  }
}

.result-card__fallback {
  color: #a42a43;
  font-weight: 800;
}

.result-card__error {
  color: #a42a43;
  font-size: 0.82rem;
}
</style>
