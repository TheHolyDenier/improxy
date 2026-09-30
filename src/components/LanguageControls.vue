<script setup lang="ts">
import BaseSelect from './ui/BaseSelect.vue'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const languageOptions = [
  { value: 'en', label: 'Inglés' },
  { value: 'es', label: 'Español' },
  { value: 'ja', label: 'Japonés' },
  { value: 'de', label: 'Alemán' },
  { value: 'fr', label: 'Francés' },
]
</script>

<template>
  <div class="language-control">
    <label for="global-language">Idioma global</label>
    <BaseSelect
      id="global-language"
      :model-value="modelValue"
      label="Idioma global"
      :options="languageOptions"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>
