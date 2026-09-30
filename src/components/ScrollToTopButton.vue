<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    enabled?: boolean
  }>(),
  {
    enabled: false,
  },
)

const { t } = useI18n()
const visible = ref(false)

const updateVisibility = () => {
  visible.value = props.enabled && globalThis.scrollY > 400
}

const scrollToTop = () => {
  globalThis.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateVisibility()
  globalThis.addEventListener('scroll', updateVisibility)
})

watch(() => props.enabled, updateVisibility)

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
      :title="t('navigation.backToTop')"
      @click="scrollToTop"
    >
      ↑
    </button>
  </div>
</template>

<style scoped>
.scroll-top-slot {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 20;
}

.scroll-top-button {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--ink);
  border-radius: 50%;
  color: #fff;
  background: var(--ink);
  box-shadow: 0 5px 12px rgba(42, 20, 37, 0.16);
  cursor: pointer;
  font: inherit;
  font-size: 1.2rem;
  line-height: 1;
}

.scroll-top-button:hover {
  background: var(--pink);
}

@media print {
  .scroll-top-slot {
    display: none;
  }
}
</style>
