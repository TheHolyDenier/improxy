<script setup lang="ts">
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
</script>

<template>
  <article class="row-editor" :class="`row-editor--${row.status}`">
    <div class="row-number">{{ row.quantity }}x</div>
    <div class="row-fields">
      <BaseInput
        :model-value="row.name"
        label="Nombre de la carta"
        @update:model-value="emit('update', { name: $event })"
      />
      <BaseInput
        :model-value="String(row.quantity)"
        type="number"
        :min="1"
        label="Cantidad"
        @update:model-value="
          emit('update', { quantity: Math.max(1, Number($event) || 1) })
        "
      />
      <BaseInput
        :model-value="row.setCode"
        label="Set opcional"
        @update:model-value="emit('update', { setCode: $event.toUpperCase() })"
      />
    </div>
    <div class="row-meta">
      <span v-if="row.status === 'loading'" class="status status--loading">
        Buscando…
      </span>
      <span v-else-if="row.status === 'resolved'" class="status status--ok">
        {{ row.printings.length }} ediciones
      </span>
      <span v-else-if="row.status === 'error'" class="status status--error">
        {{ row.errorMessage }}
      </span>
      <span v-else class="status">Pendiente</span>
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
