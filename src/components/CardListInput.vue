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
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ t('import.kicker') }}</p>
        <h2>{{ t('import.title') }}</h2>
      </div>
      <span class="section-badge">{{ t('import.badge') }}</span>
    </div>
    <p class="section-copy">
      {{ t('import.description') }} <code>2 Lightning Bolt (STA)</code>.
    </p>
    <BaseTextarea
      :model-value="modelValue"
      :label="t('import.label')"
      :placeholder="t('import.placeholder')"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div class="card-actions">
      <span v-if="errorMessages.length" class="inline-error">
        {{ errorMessages.join(' · ') }}
      </span>
      <BaseButton @click="emit('import')">{{ t('import.convert') }}</BaseButton>
    </div>
  </BaseCard>
</template>
