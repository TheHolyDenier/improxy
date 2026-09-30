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
    label: value.toUpperCase(),
  })),
)
</script>

<template>
  <div class="language-control">
    <BaseSelect
      id="global-language"
      :model-value="modelValue"
      :label="t('language.global')"
      :options="languageOptions"
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
