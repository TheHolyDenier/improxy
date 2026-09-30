<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    enabled?: boolean
    sectionIds?: string[]
  }>(),
  {
    enabled: false,
    sectionIds: () => [
      'import-section',
      'workspace-section',
      'preview-section',
    ],
  },
)

const { t } = useI18n()
const currentSection = ref(0)

const sectionElements = () =>
  props.sectionIds
    .map((id) => globalThis.document.getElementById(id))
    .filter((element): element is globalThis.HTMLElement => element !== null)

const updateSection = () => {
  const elements = sectionElements()
  const scrollPosition = globalThis.scrollY + 120
  currentSection.value = elements.reduce(
    (sectionIndex, element, index) =>
      scrollPosition >= element.offsetTop ? index : sectionIndex,
    0,
  )
}

const canGoUp = computed(() => props.enabled && currentSection.value > 0)
const canGoDown = computed(
  () => props.enabled && currentSection.value < props.sectionIds.length - 1,
)

const scrollToSection = (direction: 'up' | 'down') => {
  const elements = sectionElements()
  const targetIndex = currentSection.value + (direction === 'down' ? 1 : -1)
  const target = elements[targetIndex]
  if (!target) {
    return
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  updateSection()
  globalThis.addEventListener('scroll', updateSection)
})

watch(() => [props.enabled, props.sectionIds], updateSection, {
  deep: true,
})

onUnmounted(() => {
  globalThis.removeEventListener('scroll', updateSection)
})
</script>

<template>
  <div class="scroll-top-slot">
    <button
      v-if="props.enabled"
      class="scroll-top-button"
      :class="{ 'scroll-top-button--hidden': !canGoUp }"
      type="button"
      :disabled="!canGoUp"
      :aria-hidden="!canGoUp"
      :aria-label="t('navigation.previousSection')"
      :title="t('navigation.previousSection')"
      @click="scrollToSection('up')"
    >
      ↑
    </button>
    <button
      v-if="props.enabled"
      class="scroll-top-button"
      :class="{ 'scroll-top-button--hidden': !canGoDown }"
      type="button"
      :disabled="!canGoDown"
      :aria-hidden="!canGoDown"
      :aria-label="t('navigation.nextSection')"
      :title="t('navigation.nextSection')"
      @click="scrollToSection('down')"
    >
      ↓
    </button>
  </div>
</template>

<style scoped>
.scroll-top-slot {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 20;
  display: grid;
  gap: 8px;
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

.scroll-top-button--hidden {
  visibility: hidden;
  pointer-events: none;
}

@media print {
  .scroll-top-slot {
    display: none;
  }
}
</style>
