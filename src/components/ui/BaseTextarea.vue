<script setup lang="ts">
defineProps<{
  modelValue: string
  label: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <textarea
    class="base-textarea"
    :value="modelValue"
    :aria-label="label"
    :placeholder="placeholder"
    @input="
      $emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
    "
  />
</template>
