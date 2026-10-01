<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { RowStatus, ScryfallPrinting } from '@/domain/card'
import {
  getPrintingEditionKey,
  groupPrintingsByEdition,
  selectPrintingForLanguage,
} from '@/domain/card-language'
import { cardLanguageOptions } from '@/i18n'
import BaseSelect from './ui/BaseSelect.vue'

const props = defineProps<{
  printings: ScryfallPrinting[]
  loadedLanguages?: string[]
  selectedPrintingId: string
  language: string
  status: RowStatus
  errorMessage: string
}>()

const emit = defineEmits<{
  'update:selectedPrintingId': [value: string]
  'update:language': [value: string]
  'retry-language-search': []
}>()

const { t } = useI18n()
const loadedLanguages = computed(() => props.loadedLanguages ?? [])
const printingGroups = computed(() =>
  groupPrintingsByEdition(props.printings, props.language),
)
const selectedPrinting = computed(() =>
  printingGroups.value
    .flatMap((group) => group.printings)
    .find((printing) => printing.id === props.selectedPrintingId),
)
const selectedEditionKey = computed(() =>
  selectedPrinting.value ? getPrintingEditionKey(selectedPrinting.value) : '',
)
const printingOptions = computed(() =>
  printingGroups.value.map((group) => {
    const printing = selectPrintingForLanguage(group.printings, props.language)
    return {
      value: group.key,
      label: `${printing?.setName ?? ''} · ${printing?.collectorNumber ?? ''}`,
    }
  }),
)
const languageOptions = computed(() =>
  cardLanguageOptions.map((option) => {
    if (props.status === 'loading' && props.language === option.value) {
      return { ...option, label: `${option.label} · ${t('language.loading')}` }
    }
    if (
      props.printings.some((printing) => printing.language === option.value)
    ) {
      return option
    }

    return {
      ...option,
      label: `${option.label} · ${t(
        loadedLanguages.value.includes(option.value)
          ? 'language.unavailable'
          : 'language.search',
      )}`,
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
    group && selectPrintingForLanguage(group.printings, props.language)

  if (printing) {
    emit('update:selectedPrintingId', printing.id)
  }
}
</script>

<template>
  <div class="result-card" :class="{ 'result-card--empty': !selectedPrinting }">
    <img
      v-if="selectedPrinting"
      class="result-card__image"
      :src="selectedPrinting.imageUri"
      :alt="selectedPrinting.name"
    />
    <div class="result-card__details">
      <p v-if="status === 'loading'" class="result-card__status" role="status">
        {{ t('row.loading') }}
      </p>
      <p v-if="isLanguageFallback()" class="result-card__fallback">
        {{
          t('result.languageFallback', {
            requested: t(`cardLanguages.${language}`),
            fallback: t(`cardLanguages.${selectedPrinting?.language}`),
          })
        }}
      </p>
      <p v-if="errorMessage" class="result-card__error" role="alert">
        {{ errorMessage }}
      </p>
      <p
        v-else-if="
          !selectedPrinting && printings.length && !printingGroups.length
        "
        class="result-card__error"
      >
        {{
          t('result.languageUnavailable', {
            language: t(`cardLanguages.${language}`),
          })
        }}
      </p>
      <p v-else-if="!selectedPrinting" class="result-card__error">
        {{ t('result.empty') }}
      </p>
      <div class="result-card__controls">
        <div v-if="printingGroups.length" class="result-card__printing-control">
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
      <button
        v-if="errorMessage && status !== 'loading'"
        class="result-card__retry"
        type="button"
        @click="emit('retry-language-search')"
      >
        {{ t('result.retryLanguageSearch') }}
      </button>
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

@media (max-width: 520px) {
  .result-card__controls {
    grid-template-columns: 1fr;
  }
}

.result-card__fallback {
  color: #a42a43;
  font-weight: 800;
}

.result-card__status {
  color: var(--muted);
  font-size: 0.82rem;
}

.result-card__error {
  color: #a42a43;
  font-size: 0.82rem;
}

.result-card__retry {
  justify-self: start;
  padding: 0;
  border: 0;
  color: var(--pink-dark);
  background: transparent;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: underline;
  cursor: pointer;
}
</style>
