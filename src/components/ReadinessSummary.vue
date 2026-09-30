<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BaseButton from './ui/BaseButton.vue'
import BaseCard from './ui/BaseCard.vue'

defineProps<{
  totalCopies: number
  unresolvedCount: number
  ready: boolean
}>()

const emit = defineEmits<{
  print: []
}>()

const { t } = useI18n()
</script>

<template>
  <BaseCard class="readiness-card">
    <div>
      <p class="readiness-card__eyebrow">{{ t('readiness.kicker') }}</p>
      <h2 v-if="totalCopies" class="readiness-card__title">
        {{
          t('readiness.prepared', {
            count: totalCopies,
            plural: totalCopies,
          })
        }}
      </h2>
      <h2 v-else class="readiness-card__title">
        {{ t('readiness.empty') }}
      </h2>
      <p v-if="unresolvedCount" class="readiness-card__message">
        {{
          t('readiness.unresolved', {
            count: unresolvedCount,
            plural: unresolvedCount,
          })
        }}
      </p>
      <p v-else-if="totalCopies" class="readiness-card__message">
        {{ t('readiness.complete') }}
      </p>
    </div>
    <BaseButton :disabled="!ready" @click="emit('print')">
      {{ t('readiness.print') }}
    </BaseButton>
  </BaseCard>
</template>

<style scoped>
.readiness-card {
  align-self: start;
  position: sticky;
  top: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 26px;
  background: var(--ink);
}

.readiness-card__eyebrow,
.readiness-card__title,
.readiness-card__message {
  color: #fff;
}

.readiness-card__eyebrow {
  margin: 0;
  color: #ffcfdf;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.readiness-card__title {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: -0.04em;
}

.readiness-card__message {
  margin: 0;
}

@media (max-width: 820px) {
  .readiness-card {
    position: static;
  }
}
</style>
