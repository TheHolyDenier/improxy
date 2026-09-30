<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  type?: 'text' | 'number'
  min?: number
  label: string
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
  <input
    class="input"
    :type="type ?? 'text'"
    :value="modelValue"
    :min="min"
    :aria-label="label"
    @input="handleInput"
  />
</template>

<style scoped>
.input {
  width: 100%;
  min-height: 42px;
  padding: 9px 11px;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--ink);
  background: #fff;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input:focus {
  border-color: var(--pink);
  box-shadow: 0 0 0 4px rgba(237, 63, 122, 0.13);
}
</style>
