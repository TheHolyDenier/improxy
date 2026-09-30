<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Minus, Plus, Trash2 } from 'lucide-vue-next'

import type { CardRowState } from '@/domain/card'
import BaseButton from './ui/BaseButton.vue'

defineProps<{
  row: CardRowState
}>()

const emit = defineEmits<{
  update: [patch: Partial<CardRowState>]
  remove: []
}>()

const { t } = useI18n()
</script>

<template>
  <article
    class="row-editor"
    :class="`row-editor--${row.status}`"
    :aria-disabled="row.status === 'error'"
  >
    <div class="row-editor__fields">
      <div class="row-editor__field">
        <span class="row-editor__label">{{ t('row.name') }}</span>
        <strong class="row-editor__value" :title="row.name">
          <span
            v-if="row.status === 'loading'"
            class="row-editor__name-skeleton"
            :aria-label="t('row.loading')"
          />
          <template v-else>{{ row.name || '—' }}</template>
        </strong>
      </div>
      <div class="row-editor__field">
        <span class="row-editor__label">{{ t('row.quantity') }}</span>
        <div class="row-editor__quantity">
          <BaseButton
            type="button"
            variant="ghost"
            :aria-label="t('row.decreaseQuantity')"
            :disabled="row.quantity <= 1 || row.status === 'error'"
            @click="emit('update', { quantity: row.quantity - 1 })"
          >
            <Minus :size="16" aria-hidden="true" />
          </BaseButton>
          <output
            class="row-editor__quantity-value"
            :aria-label="t('row.quantity')"
          >
            {{ row.quantity }}
          </output>
          <BaseButton
            type="button"
            variant="ghost"
            :aria-label="t('row.increaseQuantity')"
            :disabled="row.status === 'error'"
            @click="emit('update', { quantity: row.quantity + 1 })"
          >
            <Plus :size="16" aria-hidden="true" />
          </BaseButton>
        </div>
      </div>
    </div>
    <div class="row-editor__meta">
      <div class="row-editor__actions">
        <BaseButton
          type="button"
          variant="danger"
          :aria-label="t('row.remove')"
          @click.stop="emit('remove')"
        >
          <Trash2 :size="17" aria-hidden="true" />
        </BaseButton>
      </div>
    </div>
  </article>
</template>

<style scoped>
.row-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
}

.row-editor--loading {
  border-color: #efb51f;
}

.row-editor--error {
  border-color: #ed7590;
  background: #fff5f7;
  opacity: 0.78;
}

.row-editor__fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 8px;
}

.row-editor__field {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.row-editor__label {
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 800;
  line-height: 1;
}

.row-editor__value {
  display: flex;
  align-items: center;
  min-height: 42px;
  overflow: hidden;
  color: var(--ink);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-editor__name-skeleton {
  display: block;
  width: min(180px, 75%);
  height: 18px;
  border-radius: 6px;
  background: linear-gradient(90deg, #eadcf1 25%, #f7eefa 50%, #eadcf1 75%);
  background-size: 200% 100%;
  animation: row-name-shimmer 1.2s ease-in-out infinite;
}

@keyframes row-name-shimmer {
  to {
    background-position: -200% 0;
  }
}

.row-editor__field:first-child {
  min-width: 0;
}

.row-editor__meta {
  min-width: 0;
  display: grid;
  justify-items: end;
  gap: 4px;
}

.row-editor__quantity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
}

.row-editor__quantity .button {
  min-height: 34px;
  padding: 5px 8px;
}

.row-editor__quantity-value {
  min-width: 2ch;
  color: var(--ink);
  font-weight: 800;
  text-align: center;
}

.row-editor__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 15px;
}

@media (max-width: 620px) {
  .row-editor {
    grid-template-columns: 1fr;
  }

  .row-editor__meta {
    justify-items: stretch;
  }

  .row-editor__fields {
    grid-template-columns: minmax(0, 1fr) 90px;
  }

  .row-editor__actions {
    justify-content: flex-start;
    flex-wrap: wrap;
    padding-top: 0;
  }
}
</style>
