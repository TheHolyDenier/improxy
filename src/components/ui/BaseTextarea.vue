<script setup lang="ts">
defineProps<{
  modelValue: string
  label: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: { target: unknown }) {
  if (
    typeof event.target !== 'object' ||
    event.target === null ||
    !('value' in event.target) ||
    typeof event.target.value !== 'string'
  ) {
    return
  }

  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <textarea
    class="textarea"
    :value="modelValue"
    :aria-label="label"
    :placeholder="placeholder"
    @input="handleInput"
  />
</template>

<style scoped>
.textarea {
  width: 100%;
  min-height: 150px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--ink);
  background: #fff;
  outline: none;
  resize: vertical;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.textarea:focus {
  border-color: var(--pink);
  box-shadow: 0 0 0 4px rgba(237, 63, 122, 0.13);
}
</style>
