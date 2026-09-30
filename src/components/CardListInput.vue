<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from './ui/BaseButton.vue'
import BaseCard from './ui/BaseCard.vue'
import BaseTextarea from './ui/BaseTextarea.vue'

const props = defineProps<{
  modelValue: string
  errorMessages: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  import: []
}>()

const { t } = useI18n()
const visibleErrors = ref<string[]>([])
let errorTimer: ReturnType<typeof globalThis.setTimeout> | undefined

function dismissErrors() {
  visibleErrors.value = []
  if (errorTimer) {
    globalThis.clearTimeout(errorTimer)
    errorTimer = undefined
  }
}

watch(
  () => props.errorMessages,
  (messages) => {
    dismissErrors()
    if (!messages.length) {
      return
    }

    const latestMessage = [...new Set(messages)].at(-1)
    visibleErrors.value = latestMessage ? [latestMessage] : []
    errorTimer = globalThis.setTimeout(dismissErrors, 60_000)
  },
  { immediate: true },
)

onBeforeUnmount(dismissErrors)
</script>

<template>
  <BaseCard class="import-card">
    <div class="import-card__heading">
      <div>
        <p class="import-card__eyebrow">{{ t('import.kicker') }}</p>
        <h2 class="import-card__title">{{ t('import.title') }}</h2>
      </div>
      <span class="import-card__badge">{{ t('import.badge') }}</span>
    </div>
    <p class="import-card__description">
      {{ t('import.description') }}
      <span class="import-card__example">{{ t('import.example') }}</span
      >.
    </p>
    <BaseTextarea
      :model-value="modelValue"
      :label="t('import.label')"
      :placeholder="t('import.placeholder')"
      :invalid="errorMessages.length > 0"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div class="import-card__actions">
      <BaseButton @click="emit('import')">{{ t('import.convert') }}</BaseButton>
    </div>
  </BaseCard>
  <Teleport to="body">
    <div v-if="visibleErrors.length" class="import-card__toast" role="alert">
      <div class="import-card__errors">
        <span
          v-for="errorMessage in visibleErrors"
          :key="errorMessage"
          class="import-card__error"
        >
          {{ errorMessage }}
        </span>
      </div>
      <BaseButton
        type="button"
        variant="ghost"
        :aria-label="t('errors.close')"
        @click="dismissErrors"
      >
        ×
      </BaseButton>
    </div>
  </Teleport>
</template>

<style scoped>
.import-card {
  margin-bottom: 18px;
}

.import-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.import-card__eyebrow {
  margin: 0;
  color: var(--pink-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.import-card__title {
  margin: 0;
  color: var(--ink);
  font-size: 1.8rem;
  letter-spacing: -0.04em;
}

.import-card__subtitle {
  margin: 4px 0 0;
  color: var(--muted);
}

.import-card__badge {
  padding: 7px 10px;
  border-radius: 999px;
  color: #fff;
  background: var(--lilac);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.import-card__description {
  max-width: 680px;
  color: var(--muted);
}

.import-card__example {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 6px;
  color: var(--pink-dark);
  background: #ffe3ed;
  white-space: nowrap;
}

.import-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.import-card__error {
  color: #a42a43;
  font-size: 0.82rem;
}

.import-card__errors {
  display: grid;
  gap: 3px;
}

.import-card__toast {
  position: fixed;
  z-index: 1000;
  top: 20px;
  right: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: min(440px, calc(100vw - 40px));
  padding: 14px 14px 14px 16px;
  border: 1px solid #ed7590;
  border-radius: 14px;
  background: #fff5f7;
  box-shadow: 0 16px 34px rgba(42, 20, 37, 0.18);
}

.import-card__toast .button {
  flex: 0 0 auto;
  min-height: 28px;
  padding: 2px 7px;
  color: #a42a43;
}
</style>
