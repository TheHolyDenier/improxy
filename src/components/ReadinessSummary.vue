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
      <p class="eyebrow">{{ t('readiness.kicker') }}</p>
      <h2>{{ t('readiness.prepared', { count: totalCopies }) }}</h2>
      <p v-if="unresolvedCount">
        {{ t('readiness.unresolved', { count: unresolvedCount }) }}
      </p>
      <p v-else>{{ t('readiness.complete') }}</p>
    </div>
    <BaseButton :disabled="!ready" @click="emit('print')">
      {{ t('readiness.print') }}
    </BaseButton>
  </BaseCard>
</template>
