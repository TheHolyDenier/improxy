<script setup lang="ts">
defineProps<{
  modelValue: string
  label: string
  placeholder?: string
  invalid?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: globalThis.Event) {
  if (!(event.currentTarget instanceof globalThis.HTMLTextAreaElement)) {
    return
  }

  emit('update:modelValue', event.currentTarget.value)
}
</script>

<template>
  <textarea
    class="textarea"
    :class="{ 'textarea--invalid': invalid }"
    :value="modelValue"
    :aria-label="label"
    :placeholder="placeholder"
    :disabled="disabled"
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

.textarea--invalid {
  border-color: #ed7590;
  box-shadow: 0 0 0 4px rgba(237, 63, 122, 0.1);
}
</style>
