<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { CardRowState } from '@/domain/card'
import BaseButton from './ui/BaseButton.vue'
import BaseInput from './ui/BaseInput.vue'

defineProps<{
  row: CardRowState
}>()

const emit = defineEmits<{
  update: [patch: Partial<CardRowState>]
  remove: []
  duplicate: []
  search: []
}>()

const { t } = useI18n()
</script>

<template>
  <article class="row-editor" :class="`row-editor--${row.status}`">
    <div class="row-fields">
      <label class="row-field">
        <span>{{ t('row.name') }}</span>
        <BaseInput
          :model-value="row.name"
          :label="t('row.cardNameLabel')"
          @update:model-value="emit('update', { name: $event })"
        />
      </label>
      <label class="row-field">
        <span>{{ t('row.quantity') }}</span>
        <BaseInput
          :model-value="String(row.quantity)"
          type="number"
          :min="1"
          :label="t('row.quantity')"
          @update:model-value="
            emit('update', { quantity: Math.max(1, Number($event) || 1) })
          "
        />
      </label>
      <label class="row-field">
        <span>{{ t('row.set') }}</span>
        <BaseInput
          :model-value="row.setCode"
          :label="t('row.set')"
          @update:model-value="
            emit('update', { setCode: $event.toUpperCase() })
          "
        />
      </label>
    </div>
    <div class="row-meta">
      <span v-if="row.status === 'loading'" class="status status--loading">
        {{ t('row.loading') }}
      </span>
      <span v-else-if="row.status === 'resolved'" class="status status--ok">
        {{ t('row.editions', { count: row.printings.length }) }}
      </span>
      <span v-else-if="row.status === 'error'" class="status status--error">
        <span :title="row.errorMessage">{{ t('row.error') }}</span>
      </span>
      <span v-else class="status">{{ t('row.pending') }}</span>
      <div class="row-actions">
        <BaseButton variant="ghost" @click="emit('duplicate')">
          Duplicar
        </BaseButton>
        <BaseButton variant="ghost" @click="emit('search')">
          Buscar
        </BaseButton>
        <BaseButton variant="danger" @click="emit('remove')">
          Quitar
        </BaseButton>
      </div>
    </div>
  </article>
</template>
