<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { CardRowState } from '@/domain/card'
import BaseButton from './ui/BaseButton.vue'
import BaseInput from './ui/BaseInput.vue'

const props = defineProps<{
  row: CardRowState
}>()

const emit = defineEmits<{
  update: [patch: Partial<CardRowState>]
  remove: []
  duplicate: []
  search: []
}>()

const { t } = useI18n()
const editionCount = computed(
  () =>
    new Set(
      props.row.printings.map(
        (printing) => `${printing.setCode}:${printing.collectorNumber}`,
      ),
    ).size,
)
</script>

<template>
  <article class="row-editor" :class="`row-editor--${row.status}`">
    <div class="row-editor__fields">
      <label class="row-editor__field">
        <span class="row-editor__label">{{ t('row.name') }}</span>
        <BaseInput
          :model-value="row.name"
          :label="t('row.cardNameLabel')"
          @update:model-value="emit('update', { name: $event })"
        />
      </label>
      <label class="row-editor__field">
        <span class="row-editor__label">{{ t('row.quantity') }}</span>
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
      <label class="row-editor__field">
        <span class="row-editor__label">{{ t('row.set') }}</span>
        <BaseInput
          :model-value="row.setCode"
          :label="t('row.set')"
          @update:model-value="
            emit('update', { setCode: $event.toUpperCase() })
          "
        />
      </label>
    </div>
    <div class="row-editor__meta">
      <span
        v-if="row.status === 'loading'"
        class="row-editor__status row-editor__status--loading"
      >
        {{ t('row.loading') }}
      </span>
      <span
        v-else-if="row.status === 'resolved'"
        class="row-editor__status row-editor__status--ok"
      >
        {{
          t('row.editions', {
            count: editionCount,
            plural: editionCount,
          })
        }}
      </span>
      <span
        v-else-if="row.status === 'error'"
        class="row-editor__status row-editor__status--error"
      >
        <span :title="row.errorMessage">{{ t('row.error') }}</span>
      </span>
      <span v-else class="row-editor__status">{{ t('row.pending') }}</span>
      <div class="row-editor__actions">
        <BaseButton
          type="button"
          variant="ghost"
          @click.stop="emit('duplicate')"
        >
          {{ t('row.duplicate') }}
        </BaseButton>
        <BaseButton type="button" variant="ghost" @click.stop="emit('search')">
          {{ t('row.search') }}
        </BaseButton>
        <BaseButton type="button" variant="danger" @click.stop="emit('remove')">
          {{ t('row.remove') }}
        </BaseButton>
      </div>
    </div>
  </article>
</template>

<style scoped>
.row-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
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
}

.row-editor__fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 90px 110px;
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

.row-editor__meta {
  min-width: 0;
  display: grid;
  justify-items: end;
  gap: 4px;
}

.row-editor__status {
  max-width: 100%;
  overflow: hidden;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-editor__status--loading {
  color: #9a7100;
}

.row-editor__status--ok {
  color: #2e805e;
}

.row-editor__status--error {
  color: #a42a43;
}

.row-editor__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 620px) {
  .row-editor {
    grid-template-columns: 1fr;
  }

  .row-editor__meta {
    justify-items: stretch;
  }

  .row-editor__fields {
    grid-template-columns: 1fr 74px;
  }

  .row-editor__field:last-child {
    grid-column: 1 / -1;
  }

  .row-editor__actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
