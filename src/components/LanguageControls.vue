<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseSelect from './ui/BaseSelect.vue'
import { cardLanguageCodes } from '@/i18n'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const languageOptions = computed(() =>
  cardLanguageCodes.map((value) => ({
    value,
    label: t(`cardLanguages.${value}`),
  })),
)
</script>

<template>
  <div class="language-control">
    <label for="global-language">{{ t('language.global') }}</label>
    <BaseSelect
      id="global-language"
      :model-value="modelValue"
      :label="t('language.global')"
      :options="languageOptions"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>
