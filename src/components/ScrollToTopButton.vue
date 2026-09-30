<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const visible = ref(false)

const updateVisibility = () => {
  visible.value = globalThis.scrollY > 400
}

const scrollToTop = () => {
  globalThis.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateVisibility()
  globalThis.addEventListener('scroll', updateVisibility)
})

onUnmounted(() => {
  globalThis.removeEventListener('scroll', updateVisibility)
})
</script>

<template>
  <div class="scroll-top-slot">
    <button
      v-if="visible"
      class="scroll-top-button"
      type="button"
      :aria-label="t('navigation.backToTop')"
      @click="scrollToTop"
    >
      ↑ {{ t('navigation.backToTop') }}
    </button>
  </div>
</template>

<style scoped>
.scroll-top-slot {
  display: flex;
  min-height: 46px;
  justify-content: flex-end;
  margin-top: 18px;
}

.scroll-top-button {
  align-self: flex-end;
  padding: 11px 16px;
  border: 1px solid var(--ink);
  border-radius: 999px;
  color: #fff;
  background: var(--ink);
  box-shadow: 0 10px 24px rgba(42, 20, 37, 0.22);
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.scroll-top-button:hover {
  background: var(--pink);
}
</style>
