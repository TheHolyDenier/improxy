<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit'
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    disabled?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    disabled: false,
  },
)
</script>

<template>
  <button
    class="button"
    :class="`button--${variant}`"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.button {
  min-height: 42px;
  padding: 9px 15px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-weight: 800;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

.button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.button--primary {
  color: #fff;
  background: var(--pink);
  box-shadow: 0 7px 0 var(--pink-dark);
}

.button--secondary {
  color: var(--ink);
  background: #ffd84d;
}

.button--ghost {
  min-height: 32px;
  padding: 5px 9px;
  color: var(--pink-dark);
  background: transparent;
}

.button--danger {
  min-height: 32px;
  padding: 5px 9px;
  color: #a42a43;
  background: #ffe2e8;
}
</style>
