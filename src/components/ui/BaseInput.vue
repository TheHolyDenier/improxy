<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  type?: 'text' | 'number'
  min?: number
  label: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    class="base-input"
    :type="type ?? 'text'"
    :value="modelValue"
    :min="min"
    :aria-label="label"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
</template>
