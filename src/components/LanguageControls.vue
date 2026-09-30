<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BaseSelect from './ui/BaseSelect.vue'
import { cardLanguageOptions } from '@/i18n'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="language-control">
    <BaseSelect
      id="global-language"
      :model-value="modelValue"
      :label="t('language.global')"
      :options="cardLanguageOptions"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
.language-control {
  display: grid;
  gap: 4px;
  width: 70px;
}
</style>
