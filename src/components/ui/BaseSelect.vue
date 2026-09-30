<script setup lang="ts">
defineProps<{
  modelValue: string
  label: string
  options: Array<{ value: string; label: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleChange(event: { target: unknown }) {
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
  <span class="select-wrapper">
    <select
      class="select"
      :value="modelValue"
      :aria-label="label"
      @change="handleChange"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </span>
</template>

<style scoped>
.select-wrapper {
  position: relative;
  display: block;
}

.select-wrapper::after {
  position: absolute;
  top: 50%;
  right: 14px;
  width: 7px;
  height: 7px;
  border-right: 2px solid var(--ink);
  border-bottom: 2px solid var(--ink);
  pointer-events: none;
  content: '';
  transform: translateY(-65%) rotate(45deg);
}

.select {
  width: 100%;
  min-height: 42px;
  appearance: none;
  padding: 9px 38px 9px 11px;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--ink);
  background: #fff;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.select:focus {
  border-color: var(--pink);
  box-shadow: 0 0 0 4px rgba(237, 63, 122, 0.13);
}
</style>
