<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BaseButton from './ui/BaseButton.vue'
import BaseCard from './ui/BaseCard.vue'
import BaseTextarea from './ui/BaseTextarea.vue'

defineProps<{
  modelValue: string
  errorMessages: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  import: []
}>()

const { t } = useI18n()
</script>

<template>
  <BaseCard class="import-card">
    <div class="import-card__heading">
      <div>
        <p class="import-card__eyebrow">{{ t('import.kicker') }}</p>
        <h2 class="import-card__title">{{ t('import.title') }}</h2>
      </div>
      <span class="import-card__badge">{{ t('import.badge') }}</span>
    </div>
    <p class="import-card__description">
      {{ t('import.description') }}
      <span class="import-card__example">{{ t('import.example') }}</span
      >.
    </p>
    <BaseTextarea
      :model-value="modelValue"
      :label="t('import.label')"
      :placeholder="t('import.placeholder')"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div class="import-card__actions">
      <span v-if="errorMessages.length" class="import-card__error">
        {{ errorMessages.join(' · ') }}
      </span>
      <BaseButton @click="emit('import')">{{ t('import.convert') }}</BaseButton>
    </div>
  </BaseCard>
</template>

<style scoped>
.import-card {
  margin-bottom: 18px;
}

.import-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.import-card__eyebrow {
  margin: 0;
  color: var(--pink-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.import-card__title {
  margin: 0;
  color: var(--ink);
  font-size: 1.8rem;
  letter-spacing: -0.04em;
}

.import-card__badge {
  padding: 7px 10px;
  border-radius: 999px;
  color: #fff;
  background: var(--lilac);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.import-card__description {
  max-width: 680px;
  color: var(--muted);
}

.import-card__example {
  padding: 2px 6px;
  border-radius: 6px;
  color: var(--pink-dark);
  background: #ffe3ed;
}

.import-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.import-card__error {
  margin-right: auto;
  color: #a42a43;
  font-size: 0.82rem;
}
</style>
