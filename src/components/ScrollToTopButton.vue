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
  <button
    v-if="visible"
    class="scroll-top-button"
    type="button"
    :aria-label="t('navigation.backToTop')"
    @click="scrollToTop"
  >
    ↑ {{ t('navigation.backToTop') }}
  </button>
</template>
